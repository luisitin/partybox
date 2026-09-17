// Views for Bingo. Nothing in this game is secret: a card only reaches the TV when its owner
// presses BINGO!, and then everyone is meant to see it. Phones get their own card and daubs; the
// spectator phone gets the called list instead (players must remember — that is the design).
// With several cards per player the phone gets them all; a claim carries the one card checked.
import { controllerEnvelope, envelope, hasPlayer } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { calledNumbers, letterOf } from './cards';
import type { Letter } from './cards';
import { callFor } from './content';
import { PATTERN_HINT, PATTERN_LABEL, patternCells } from './patterns';
import { canClaim } from './phases/play';
import { standings } from './scoring';
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
  /** Cards dealt to every player each round (the `cards` setting). */
  cardsPerPlayer: number;
  current: CallView | null;
  /** Just the one before — no history beyond that, on purpose. */
  previous: CallView | null;
  /** Numbers called so far this round. */
  callIndex: number;
  /** check: the card being checked; bingo: the winner's card. */
  claim: ClaimView | null;
  /** bingo / scoreboard: the last round's winner (null = the deck ran out). */
  winnerId: string | null;
  winnerName: string | null;
  standings: StandingRow[];
}

export interface BingoTvView extends TvView, Common {
  /** Every number called so far this round, in call order — the TV's hall board (review-loop #1). */
  called: number[];
  /** VIP toggles at game selection: the board and the previous call are optional on the TV. */
  showBoard: boolean;
  showPrevious: boolean;
}

export interface BingoControllerView extends ControllerView, Common {
  /** Whether the TV shows the hall board — decides how a reconnecting phone reports missed calls. */
  showBoard: boolean;
  /** Nicknames of the last few calls, newest last (numbers stay on the TV). */
  recent: string[];
  /** My cards this round; null for spectators. */
  cards: number[][] | null;
  /** Per card, in the same order. */
  daubs: number[][];
  /** play: true unless waiting for the next number after a failed claim. */
  canClaim: boolean;
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

/** Nicknames of the last n calls, oldest first (a reconnecting phone names what it missed). */
function recentCalls(state: State, n: number): string[] {
  const out: string[] = [];
  for (let i = Math.max(0, state.round.drawn - n); i < state.round.drawn; i++) {
    const view = callView(state, i);
    if (view) out.push(view.call);
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

function statusOf(state: State): (id: string) => PlayerStatus {
  return (id) => {
    if (!Object.hasOwn(state.round.cards, id)) return 'spectator';
    if (state.phase.id === 'play' || state.phase.id === 'check') return 'active';
    if (state.phase.id === 'bingo' && state.round.winnerId === id) return 'submitted';
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
    cardsPerPlayer: state.settings.cards,
    current: state.phase.id === 'intro' ? null : callView(state, round.drawn - 1),
    previous: state.phase.id === 'intro' ? null : callView(state, round.drawn - 2),
    callIndex: round.drawn,
    claim: state.phase.id === 'check' || state.phase.id === 'bingo' ? claimView(state) : null,
    winnerId,
    winnerName: winnerId ? (state.players[winnerId]?.name ?? '?') : null,
    standings: standings(state),
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
    waitingForCall:
      player &&
      (state.phase.id === 'play' || state.phase.id === 'check') &&
      state.round.drawn < (state.round.waitForCall[playerId] ?? 0),
    called: player ? [] : calledNumbers(state),
    showBoard: state.settings.showBoard,
    recent: recentCalls(state, 4),
    myWins: state.wins[playerId] ?? 0,
  };
}
