// tvView / controllerView for Blanks. The TV never shows a hand or a submission before "reveal",
// and no author before "result"; a phone shows only its owner's hand and own play until then. From
// "reveal" on, TV and phones carry the same cards so the game is playable without the TV.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import type { ControllerView, GameAward, PlayerStatus, TvView } from '@partybox/game-sdk';
import { whiteText } from './content';
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
} from './round';
import { awardsFor, standings } from './scoring';
import { bestCardView, standingsRows } from './views-board';
import { blackChoices, blackView, person, revealedCards, stageCards } from './views-table';
import type { BlackView, CardView, PersonView, RevealedCard } from './views-table';
export type { BlackView, CardView, PersonView, RevealedCard } from './views-table';
import type { BestCardView, StandingsRow } from './views-board';
export type { BestCardView, StandingsRow } from './views-board';

import type { JudgeMode, State } from './types';

export interface BlanksTvView extends TvView {
  round: number;
  rounds: number;
  judgeMode: JudgeMode;
  /** Clocks on picking, voting and the result; false = anyone taps Next (the shells hide the timer). */
  timed: boolean;
  /** czar mode: this round's judge. */
  czar: PersonView | null;
  black: BlackView | null;
  /** pick (czar mode): the black cards the judge chooses between. */
  blackChoices: BlackView[];
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
  /** intro (round 2 on) + result + final + done. */
  standings: StandingsRow[];
  /** final + done. */
  awards: GameAward[];
  /** final + done: the card that took the most votes all night, if any took one. */
  bestCard: BestCardView | null;
}

export interface BlanksControllerView extends ControllerView {
  round: number;
  rounds: number;
  judgeMode: JudgeMode;
  timed: boolean;
  czar: PersonView | null;
  black: BlackView | null;
  blackChoices: BlackView[];
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

function statusOf(state: State): (id: string) => PlayerStatus {
  const phase = state.phase.id;
  return (id) => {
    if (phase === 'pick') return isCzar(state, id) ? 'active' : 'waiting';
    if (phase === 'answer') {
      if (isCzar(state, id)) return 'waiting';
      return hasPlayed(state, id) ? 'submitted' : 'active';
    }
    if (phase === 'judge') {
      if (!eligibleVoters(state).includes(id) || !hasVotableSlot(state, id)) return 'waiting';
      return Object.hasOwn(state.votes, id) ? 'submitted' : 'active';
    }
    return 'active'; // nothing to do in intro / reveal / result / final / done: plain chips
  };
}

/** Untimed rounds keep a long hidden fallback on picking, voting and the result: no clock on
 *  screen. The "Everyone's in!" beat hides a timed round's clock too (it would jump to 1). The
 *  round card, each read-out and the final board are a rhythm, not a countdown: a draining bar,
 *  no number (review-loop #133 — a "6 s" clock on every card read nothing but urgency). */
function timerMode(state: State): 'normal' | 'quiet' | 'hidden' {
  const phase = state.phase.id;
  const untimed = phase === 'pick' || phase === 'answer' || phase === 'judge' || phase === 'result';
  if (allIn(state)) return 'hidden';
  if (phase === 'intro' || phase === 'reveal' || phase === 'final') return 'quiet';
  return !state.settings.timed && untimed ? 'hidden' : 'normal';
}

function votersExpected(state: State): number {
  return eligibleVoters(state).filter(
    (id) => state.players[id]?.connected && hasVotableSlot(state, id),
  ).length;
}

export function tvView(state: State, gameId: string): BlanksTvView {
  const phase = state.phase.id;
  // The round card carries the standings from round 2 on, so the room sees where it stands
  // between rounds (review-loop #164).
  const onStage =
    phase === 'result' ||
    phase === 'final' ||
    phase === 'done' ||
    (phase === 'intro' && state.round > 1);
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state), scores: state.scores }),
    timerMode: timerMode(state),
    round: state.round,
    rounds: state.settings.rounds,
    judgeMode: state.settings.judge,
    timed: state.settings.timed,
    czar: person(state, state.czarId),
    black: blackView(state),
    blackChoices: blackChoices(state),
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
    awards: phase === 'final' || phase === 'done' ? awardsFor(state) : [],
    bestCard: phase === 'final' || phase === 'done' ? bestCardView(state) : null,
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
    blackChoices: blackChoices(state),
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
    standings:
      phase === 'result' ||
      phase === 'final' ||
      phase === 'done' ||
      (phase === 'intro' && state.round > 1)
        ? standingsRows(state)
        : [],
  };
}
