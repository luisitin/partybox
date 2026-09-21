// Views for Bingo. Nothing in this game is secret: a card only reaches the TV when its owner
// presses BINGO!, and then everyone is meant to see it. Phones get their own cards and daubs; the
// spectator view carries the called list (the shell shows spectators its own waiting screen,
// loop #22, so nothing renders it today — players must remember; that is the design).
// With several cards per player the phone gets them all; a claim carries the one card checked.
import { controllerEnvelope, envelope, hasPlayer } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { calledNumbers, letterOf } from './cards';
import { closePlayers } from './close';
import type { Letter } from './cards';
import { callFor } from './content';
import { PATTERN_HINT, PATTERN_LABEL, patternCells } from './patterns';
import { menusOpen } from './claims';
import { canContinue, liveCards } from './phases/bingo';
import { waitingOn } from './phases/intro';
import { canClaim, isHeld } from './phases/play';
import { pointsFor, standings } from './scoring';
import type { StandingRow } from './scoring';
import type { Claim, Pattern, State } from './types';

export interface CallView {
  number: number;
  letter: Letter;
  call: string;
}

export interface ClaimView extends Claim {
  name: string;
  /** The card that was checked (`cardIndex` of the claimant's `cardCount`). */
  card: number[];
  cardCount: number;
}

interface Common {
  round: number;
  totalRounds: number;
  pattern: Pattern;
  patternLabel: string;
  patternHint: string;
  patternCells: number[];
  /** Every round's pattern, in order (the intro lists the programme). */
  patterns: Pattern[];
  /** intro (loop 344): people still picking their cards (names) — empty once the 3 · 2 · 1 runs. */
  waitingOn: string[];
  /** Cards dealt to every player each round (the `cards` setting). */
  cardsPerPlayer: number;
  current: CallView | null;
  /** Just the one before — no history beyond that, on purpose. */
  previous: CallView | null;
  /** Numbers called so far this round. */
  callIndex: number;
  /** check: the card being checked; bingo: the winner's card. */
  claim: ClaimView | null;
  /** bingo / scoreboard: the last bingo's winner (null = the deck ran out). */
  winnerId: string | null;
  winnerName: string | null;
  standings: StandingRow[];
  /** bingo: whether the round can keep going (same pattern / for a blackout); any player decides. */
  decide: { same: boolean; blackout: boolean } | null;
  /** How many bingos this round has had so far (a continued round celebrates more than one). */
  bingosThisRound: number;
  /**
   * check / bingo: the TV's verdict has landed (the server's first tick of the phase, ADR-033).
   * The phones show nothing conclusive before this — no local clock (loop 258).
   */
  verdictShown: boolean;
  /** bingo: what this bingo was worth (3, 2, 1, then ½ under a pattern). */
  claimPoints: number;
  /** bingo: nothing can continue (every card full, or no contest left): on to the scores by itself. */
  autoEnd: boolean;
  /** Bingos under the current pattern this round ("2nd bingo", "1st blackout"). */
  patternBingos: number;
  /** bingo: a choice already made mid-celebration, applied when the reveal is done. */
  pendingDecision: 'same' | 'blackout' | 'next' | null;
  /** bingo: who made the held choice (their name), for "Priya picked: …". */
  pendingBy: string | null;
  /** play: whose BINGO! is armed (dibs), until when (server clock), and who waits behind. */
  arm: { playerId: string; name: string; card: number; until: number } | null;
  queue: string[];
  /** play: the caller is held — these players have the card-style menu open. */
  pausedBy: string[];
  /** play: the last menu closed; calling resumes at this time (3 · 2 · 1 on every screen). */
  resumeAt: number | null;
  /** play, during the 3 · 2 · 1 after "keep going": who picked it (their name) — loop 325. */
  resumeBy: string | null;
  /** play: when the number up was called (server clock). A new stamp is a call to speak and feel;
   * a hold or a countdown does not change it, so nothing re-calls a number (loop 294). */
  calledAt: number | null;
}

export interface BingoTvView extends TvView, Common {
  /** Every number called so far this round, in call order — the TV's hall board (review-loop #1). */
  called: number[];
  /** VIP toggles at game selection: the board and the previous call are optional on the TV. */
  showBoard: boolean;
  showPrevious: boolean;
  /** R2-01: players with a live card one daub from the pattern (play only). */
  closeIds: string[];
}

export interface BingoControllerView extends ControllerView, Common {
  /** intro: this phone has tapped Ready (its cards are picked; no more swaps). */
  ready: boolean;
  /** intro: everyone else is ready and the room waits on this phone alone (loop 351). */
  lastOne: boolean;
  /** play, during the 3 · 2 · 1 after "keep going": this phone made the choice (loop 326). */
  resumeMine: boolean;
  /** Whether the TV shows the hall board — decides how a reconnecting phone reports missed calls. */
  showBoard: boolean;
  /** The last few calls as "O 65", newest last — a reconnecting phone names what it missed. */
  recent: string[];
  /** My cards this round; null for spectators. */
  cards: number[][] | null;
  /** Per card, in the same order. */
  daubs: number[][];
  /** play: true unless waiting for the next number after a failed claim (or every card won). */
  canClaim: boolean;
  /** My cards that already won the current pattern this round (locked). */
  won: number[];
  /** Every one of my cards has won: nothing left to claim until the pattern or round changes. */
  doneForRound: boolean;
  /** My cards that may claim right now (live, and no wait after a failed claim). */
  claimable: number[];
  /** intro: my cards that can still be swapped once ("deal me another"). */
  swappable: number[];
  /** My card-style menu is open (the server's view of it — the phone mirrors this). */
  menuOpen: boolean;
  /** I tapped BINGO! while someone else had dibs: my place in the queue (1 = next), 0 = not queued. */
  queuePlace: number;
  /** The card I queued with (null when not queued): only its button says "you're next". */
  queuedCard: number | null;
  /** The phone says why the button is off right after your own failed claim. */
  waitingForCall: boolean;
  /** Spectators only (players must remember). */
  called: number[];
  myWins: number;
}

function callView(state: State, index: number): CallView | null {
  const number = state.round.deck[index];
  if (index < 0 || number === undefined) return null;
  return { number, letter: letterOf(number), call: callFor(number, state.settings.spicy) };
}

/** The last n calls as "O 65", oldest first (a reconnecting phone names what it missed — the
 *  number, not the nickname: pass 866 read "you missed Sixty-five — old age pension"). */
function recentCalls(state: State, n: number): string[] {
  const out: string[] = [];
  for (let i = Math.max(0, state.round.drawn - n); i < state.round.drawn; i++) {
    const view = callView(state, i);
    if (view) out.push(`${view.letter} ${view.number}`);
  }
  return out;
}

function claimView(state: State): ClaimView | null {
  const claim = state.round.claim;
  if (!claim) return null;
  const cards = state.round.cards[claim.playerId] ?? [];
  return {
    ...claim,
    name: state.players[claim.playerId]?.name ?? '?',
    card: cards[claim.cardIndex] ?? [],
    cardCount: cards.length,
  };
}

/** A win the TV is still revealing: `round.won` has it, the phones must not yet. */
function underReveal(state: State, playerId: string, card: number): boolean {
  const c = state.round.claim;
  return (
    state.phase.id === 'bingo' &&
    !state.round.judged &&
    c !== null &&
    c.playerId === playerId &&
    c.cardIndex === card
  );
}

function statusOf(state: State): (id: string) => PlayerStatus {
  return (id) => {
    if (!Object.hasOwn(state.round.cards, id)) return 'spectator';
    // The card-pick step (loop 344): a ✓ for everyone who is ready (bots count as ready).
    if (state.phase.id === 'intro')
      return state.round.ready.includes(id) || state.players[id]?.bot ? 'submitted' : 'active';
    // Every card won: done for the pattern (the chip shows it while the others keep daubing).
    if (state.phase.id === 'play' || state.phase.id === 'check')
      return liveCards(state, id).length === 0 ? 'submitted' : 'active';
    // The winner's check mark waits for the TV's verdict (loop 257).
    if (state.phase.id === 'bingo' && state.round.winnerId === id && state.round.judged)
      return 'submitted';
    return 'waiting';
  };
}

function common(state: State): Common {
  const round = state.round;
  const winnerId =
    state.phase.id === 'bingo' || state.phase.id === 'scoreboard' ? round.winnerId : null;
  return {
    round: round.number,
    totalRounds: state.settings.rounds,
    pattern: round.pattern,
    patternLabel: PATTERN_LABEL[round.pattern],
    patternHint: PATTERN_HINT[round.pattern],
    patternCells: patternCells(round.pattern),
    patterns: state.settings.patterns,
    waitingOn:
      state.phase.id === 'intro'
        ? waitingOn(state).map((id) => state.players[id]?.name ?? '?')
        : [],
    cardsPerPlayer: state.settings.cards,
    current: state.phase.id === 'intro' ? null : callView(state, round.drawn - 1),
    previous: state.phase.id === 'intro' ? null : callView(state, round.drawn - 2),
    callIndex: round.drawn,
    claim: state.phase.id === 'check' || state.phase.id === 'bingo' ? claimView(state) : null,
    winnerId,
    winnerName: winnerId ? (state.players[winnerId]?.name ?? '?') : null,
    standings: standings(state),
    decide: state.phase.id === 'bingo' ? canContinue(state) : null,
    bingosThisRound: round.bingos,
    claimPoints: winnerId ? pointsFor(round.patternBingos) : 0,
    verdictShown: (state.phase.id === 'check' || state.phase.id === 'bingo') && round.judged,
    autoEnd:
      state.phase.id === 'bingo' &&
      winnerId !== null &&
      !canContinue(state).same &&
      !canContinue(state).blackout,
    patternBingos: round.patternBingos,
    pendingDecision:
      round.decision === null
        ? null
        : round.decision.type === 'next'
          ? 'next'
          : round.decision.pattern,
    pendingBy: round.decision ? (state.players[round.decision.by]?.name ?? null) : null,
    arm:
      state.phase.id === 'play' && round.arm
        ? { ...round.arm, name: state.players[round.arm.playerId]?.name ?? '?' }
        : null,
    queue:
      state.phase.id === 'play'
        ? round.queue.map((q) => state.players[q.playerId]?.name ?? '?')
        : [],
    pausedBy:
      isHeld(state) && menusOpen(state)
        ? round.menus.map((id) => state.players[id]?.name ?? '?')
        : [],
    resumeAt: state.phase.id === 'play' ? round.resumeAt : null,
    calledAt: state.phase.id === 'play' ? round.calledAt : null,
    resumeBy:
      state.phase.id === 'play' && round.resumeAt !== null && round.resumeBy
        ? (state.players[round.resumeBy]?.name ?? null)
        : null,
  };
}

export function tvView(state: State, gameId: string): BingoTvView {
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state), scores: state.wins }),
    timerMode: 'quiet',
    ...common(state),
    called: calledNumbers(state),
    showBoard: state.settings.showBoard,
    showPrevious: state.settings.showPrevious,
    closeIds: closePlayers(state),
  };
}

export function controllerView(
  state: State,
  gameId: string,
  playerId: string,
): BingoControllerView {
  const player = hasPlayer(state, playerId) && Object.hasOwn(state.round.cards, playerId);
  return {
    ...controllerEnvelope(state, gameId, playerId, {
      statusOf: statusOf(state),
      scores: state.wins,
    }),
    timerMode: 'quiet',
    ...common(state),
    cards: player ? (state.round.cards[playerId] ?? null) : null,
    daubs: player ? (state.round.daubs[playerId] ?? []) : [],
    canClaim: canClaim(state, playerId),
    // The card under the TV's reveal is not "won" on any phone until the verdict lands (loop
    // 302: the winner's thumbnail read "BINGO ✓" and the next card came up mid-sweep).
    won: player
      ? (state.round.won[playerId] ?? []).filter((c) => !underReveal(state, playerId, c))
      : [],
    doneForRound:
      player &&
      liveCards(state, playerId).length === 0 &&
      !(state.phase.id === 'bingo' && !state.round.judged && state.round.winnerId === playerId),
    claimable: player ? liveCards(state, playerId).filter((c) => canClaim(state, playerId, c)) : [],
    swappable:
      player && state.phase.id === 'intro'
        ? (state.round.cards[playerId] ?? [])
            .map((_, i) => i)
            .filter((i) => !(state.round.swapped[playerId] ?? []).includes(i))
        : [],
    menuOpen: state.round.menus.includes(playerId),
    queuePlace: state.round.queue.findIndex((q) => q.playerId === playerId) + 1,
    queuedCard: state.round.queue.find((q) => q.playerId === playerId)?.card ?? null,
    waitingForCall:
      player &&
      (state.phase.id === 'play' || state.phase.id === 'check') &&
      state.round.drawn < (state.round.waitForCall[playerId] ?? 0),
    called: player ? [] : calledNumbers(state),
    ready: state.phase.id === 'intro' && state.round.ready.includes(playerId),
    lastOne:
      state.phase.id === 'intro' &&
      Object.keys(state.round.cards).length > 1 &&
      (() => {
        const left = waitingOn(state);
        return left.length === 1 && left[0] === playerId;
      })(),
    resumeMine:
      state.phase.id === 'play' &&
      state.round.resumeAt !== null &&
      state.round.resumeBy === playerId,
    showBoard: state.settings.showBoard,
    recent: recentCalls(state, 4),
    myWins: state.wins[playerId] ?? 0,
  };
}
