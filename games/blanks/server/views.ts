// tvView / controllerView for Blanks. The TV never shows a hand or a submission before "reveal",
// and no author before "result"; a phone shows only its owner's hand and own play until then. From
// "reveal" on, TV and phones carry the same cards so the game is playable without the TV.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, GameAward, PlayerStatus, TvView } from '@partybox/game-sdk';
import { blackCard, whiteText } from './content';
import { allIn } from './phases/answer';
import {
  canVote,
  eligibleVoters,
  hasPlayed,
  hasVotableSlot,
  isCzar,
  isWalkover,
  playedCount,
  playersExpected,
  tally,
} from './round';
import { awardsFor, standings } from './scoring';
import { RANDO, RANDO_NAME } from './types';
import type { JudgeMode, State } from './types';

export interface BlackView {
  text: string;
  pick: number;
  draw: number;
}

export interface PersonView {
  id: string;
  name: string;
  avatarId: string;
  connected: boolean;
}

/** One anonymous submission on stage. */
export interface CardView {
  slot: number;
  whites: string[];
}

/** A submission once authors are public (result). */
export interface RevealedCard extends CardView {
  submitterId: string;
  name: string;
  avatarId: string;
  /** The phantom player (Rando setting). */
  rando: boolean;
  votes: number;
  voterIds: string[];
  winner: boolean;
}

export interface StandingsRow {
  playerId: string;
  name: string;
  avatarId: string;
  connected: boolean;
  score: number;
  rank: number;
}

export interface BlanksTvView extends TvView {
  round: number;
  rounds: number;
  judgeMode: JudgeMode;
  /** Clocks on picking, voting and the result; false = anyone taps Next (the shells hide the timer). */
  timed: boolean;
  /** czar mode: this round's judge. */
  czar: PersonView | null;
  black: BlackView | null;
  /** answer: progress. */
  playedCount: number;
  playersExpected: number;
  /** reveal: the cards read so far (up to and including `revealIndex`); judge: every card. */
  cards: CardView[];
  /** reveal: the slot on stage, else -1. */
  revealIndex: number;
  /** reveal + judge + result: how many cards are in play this round ("Card 2 of 5"). */
  cardCount: number;
  /** judge: progress. */
  votedCount: number;
  votersExpected: number;
  /** result only. */
  revealed: RevealedCard[];
  winnerIds: string[];
  walkover: boolean;
  /** result + done. */
  standings: StandingsRow[];
  /** done only. */
  awards: GameAward[];
}

export interface BlanksControllerView extends ControllerView {
  round: number;
  rounds: number;
  judgeMode: JudgeMode;
  timed: boolean;
  czar: PersonView | null;
  black: BlackView | null;
  /** 'judge' = this round's czar (plays no card, picks the winner). */
  role: 'player' | 'judge' | 'spectator';
  /** answer: my hand. Empty in every other phase (the TV never needs it, the phone only then). */
  hand: { id: string; text: string }[];
  /** My cards this round, in blank order; null until the server accepted a play. */
  myPlay: string[] | null;
  playedCount: number;
  playersExpected: number;
  cards: CardView[];
  revealIndex: number;
  cardCount: number;
  /** judge: what this phone may do. `mySlot` is my own card (not votable). */
  vote: { canVote: boolean; mySlot: number | null; votedSlot: number | null } | null;
  votedCount: number;
  votersExpected: number;
  revealed: RevealedCard[];
  winnerIds: string[];
  walkover: boolean;
  iWon: boolean;
  myScore: number;
  myRank: number;
  standings: StandingsRow[];
}

function blackView(state: State): BlackView | null {
  if (state.round === 0) return null;
  const { text, pick, draw } = blackCard(state.blackId);
  return { text, pick, draw };
}

function person(state: State, id: string | null): PersonView | null {
  const p = id ? state.players[id] : undefined;
  return p ? { id: p.id, name: p.name, avatarId: p.avatarId, connected: p.connected } : null;
}

function cardViews(state: State, upTo: number): CardView[] {
  return state.slots.slice(0, upTo).map((submitter, slot) => ({
    slot,
    whites: (state.submissions[submitter] ?? []).map(whiteText),
  }));
}

/** Cards on stage for this phase: none until reveal, one more per reveal step, all from judge on. */
function stageCards(state: State): CardView[] {
  const phase = state.phase.id;
  if (phase === 'reveal') return cardViews(state, state.revealIndex + 1);
  if (phase === 'judge' || phase === 'result') return cardViews(state, state.slots.length);
  return [];
}

function revealedCards(state: State): RevealedCard[] {
  if (state.phase.id !== 'result') return [];
  const winners = new Set(state.winners);
  return tally(state).map((t) => {
    const p = state.players[t.submitterId];
    const rando = t.submitterId === RANDO;
    return {
      slot: t.slot,
      whites: t.cards.map(whiteText),
      submitterId: t.submitterId,
      name: rando ? RANDO_NAME : (p?.name ?? '?'),
      avatarId: rando ? 'robot' : (p?.avatarId ?? 'ghost'),
      rando,
      votes: t.votes,
      voterIds: t.voterIds,
      winner: winners.has(t.submitterId),
    };
  });
}

function statusOf(state: State): (id: string) => PlayerStatus {
  const phase = state.phase.id;
  return (id) => {
    if (phase === 'answer') {
      if (isCzar(state, id)) return 'waiting';
      return hasPlayed(state, id) ? 'submitted' : 'active';
    }
    if (phase === 'judge') {
      if (!eligibleVoters(state).includes(id) || !hasVotableSlot(state, id)) return 'waiting';
      return Object.hasOwn(state.votes, id) ? 'submitted' : 'active';
    }
    return 'active'; // nothing to do in intro / reveal / result / done: plain chips
  };
}

function standingsRows(state: State): StandingsRow[] {
  return standings(state).map((row) => {
    const p = state.players[row.playerId];
    return {
      ...row,
      name: p?.name ?? '?',
      avatarId: p?.avatarId ?? 'ghost',
      connected: !!p?.connected,
    };
  });
}

/** Untimed rounds keep a long hidden fallback on picking, voting and the result: no clock on
 *  screen. The "Everyone's in!" beat hides a timed round's clock too (it would jump to 1). */
function timerMode(state: State): 'normal' | 'hidden' {
  const phase = state.phase.id;
  const untimed = phase === 'answer' || phase === 'judge' || phase === 'result';
  if (allIn(state)) return 'hidden';
  return !state.settings.timed && untimed ? 'hidden' : 'normal';
}

function votersExpected(state: State): number {
  return eligibleVoters(state).filter(
    (id) => state.players[id]?.connected && hasVotableSlot(state, id),
  ).length;
}

export function tvView(state: State, gameId: string): BlanksTvView {
  const phase = state.phase.id;
  const onStage = phase === 'result' || phase === 'done';
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state), scores: state.scores }),
    timerMode: timerMode(state),
    round: state.round,
    rounds: state.settings.rounds,
    judgeMode: state.settings.judge,
    timed: state.settings.timed,
    czar: person(state, state.czarId),
    black: blackView(state),
    playedCount: playedCount(state),
    playersExpected: playersExpected(state),
    cards: stageCards(state),
    revealIndex: phase === 'reveal' ? state.revealIndex : -1,
    cardCount: state.slots.length,
    votedCount: Object.keys(state.votes).length,
    votersExpected: votersExpected(state),
    revealed: revealedCards(state),
    winnerIds: phase === 'result' ? [...state.winners] : [],
    walkover: phase === 'result' && isWalkover(state),
    standings: onStage ? standingsRows(state) : [],
    awards: phase === 'done' ? awardsFor(state) : [],
  };
}

export function controllerView(
  state: State,
  gameId: string,
  playerId: string,
): BlanksControllerView {
  const phase = state.phase.id;
  const player = Object.hasOwn(state.players, playerId);
  const me = standings(state).find((row) => row.playerId === playerId);
  const mine = state.submissions[playerId];
  const mySlot = state.slots.indexOf(playerId);
  return {
    ...controllerEnvelope(state, gameId, playerId, {
      statusOf: statusOf(state),
      scores: state.scores,
    }),
    timerMode: timerMode(state),
    round: state.round,
    rounds: state.settings.rounds,
    judgeMode: state.settings.judge,
    timed: state.settings.timed,
    czar: person(state, state.czarId),
    black: blackView(state),
    role: !player ? 'spectator' : isCzar(state, playerId) ? 'judge' : 'player',
    // The judge keeps their hand for later rounds but has nothing to play now: no list.
    hand:
      phase === 'answer' && player && !isCzar(state, playerId)
        ? (state.hands[playerId] ?? []).map((id) => ({ id, text: whiteText(id) }))
        : [],
    myPlay: mine && phase !== 'intro' ? mine.map(whiteText) : null,
    playedCount: playedCount(state),
    playersExpected: playersExpected(state),
    cards: stageCards(state),
    revealIndex: phase === 'reveal' ? state.revealIndex : -1,
    cardCount: state.slots.length,
    vote:
      phase === 'judge' && player
        ? {
            canVote: state.slots.some((_, slot) => canVote(state, playerId, slot)),
            mySlot: mySlot === -1 ? null : mySlot,
            votedSlot: state.votes[playerId] ?? null,
          }
        : null,
    votedCount: Object.keys(state.votes).length,
    votersExpected: votersExpected(state),
    revealed: revealedCards(state),
    winnerIds: phase === 'result' ? [...state.winners] : [],
    walkover: phase === 'result' && isWalkover(state),
    iWon: phase === 'result' && state.winners.includes(playerId),
    myScore: me?.score ?? 0,
    myRank: me?.rank ?? 0,
    standings: phase === 'result' || phase === 'done' ? standingsRows(state) : [],
  };
}
