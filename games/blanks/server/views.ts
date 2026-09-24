// tvView / controllerView for Blanks. The TV never shows a hand or a submission before "reveal",
// and no author before "result"; a phone shows only its owner's hand and own play until then. From
// "reveal" on, TV and phones carry the same cards so the game is playable without the TV.
import { controllerEnvelope, envelope } from '@partybox/game-sdk';
import { readingFor } from './speech';
import type { ControllerView, GameAward, PlayerStatus, TvView } from '@partybox/game-sdk';
import { whiteText } from './content';
import { allIn, redrawsLeft } from './phases/answer';
import { judgePicked, votesIn } from './phases/judge';
import {
  canVote,
  eligibleVoters,
  hasPlayed,
  hasVotableSlot,
  isCzar,
  sitsOut,
  isWalkover,
  readingOpen,
  playedCount,
  playersExpected,
  voiced,
} from './round';
import { awardsFor, standings } from './scoring';
import { bestCardView, standingsRows, streakView } from './views-board';
import { blackChoices, blackView, person, revealedCards, stageCards } from './views-table';
import type { BlackView, CardView, PersonView, RevealedCard } from './views-table';
export type { BlackView, CardView, PersonView, RevealedCard } from './views-table';
import type { BestCardView, StandingsRow, StreakView } from './views-board';
export type { BestCardView, StandingsRow, StreakView } from './views-board';

import type { JudgeMode, State } from './types';

export interface BlanksTvView extends TvView, Voice {
  round: number;
  /** I-147 A: this round is sudden death — the tied players, or null. */
  tieBreak: string[] | null;
  rounds: number;
  judgeMode: JudgeMode;
  /** Clocks on picking, voting and the result; false = the VIP taps Next (the shells hide the timer). */
  timed: boolean;
  /** czar mode: this round's judge. */
  czar: PersonView | null;
  /** I-773 A: this round's judge went; the room votes in their place, and the TV says why. */
  judgeGone: { name: string; why: 'dropped' | 'kicked' | 'left' } | null;
  /** vote mode, reveal only: the seat asked to read the cards out loud (review-loop #248). */
  /** I-149 B: who called the winning card. */
  calledIt: { name: string; avatarId: string }[];
  reader: PersonView | null;
  /** I-143 B: nobody in the room can read — the TV does. */
  everyoneIsABot: boolean;
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
  /** intro: somebody has won two or more rounds in a row. */
  streak: StreakView | null;
  /** final + done. */
  awards: GameAward[];
  /** final + done: the card that took the most votes all night, if any took one. */
  bestCard: BestCardView | null;
}

/** READER-VOICES (ADR-045): the room has a voice, and the reading that is up now (once made). */
interface Voice {
  voice: boolean;
  speech: { key: string; url: string } | null;
}

export interface BlanksControllerView extends ControllerView, Voice {
  round: number;
  rounds: number;
  judgeMode: JudgeMode;
  timed: boolean;
  czar: PersonView | null;
  /** vote mode, reveal only: whoever is reading this round's cards out. */
  reader: PersonView | null;
  /** I-143 C: this phone may take the reading (it is up for grabs and I am a connected player). */
  readingOpen: boolean;
  black: BlackView | null;
  blackChoices: BlackView[];
  /** 'judge' = this round's czar (plays no card, picks the winner). */
  role: 'player' | 'judge' | 'spectator';
  /** I-147 A: answer phase of a tie-break, and this phone is outside the tie. */
  sitsOut: boolean;
  /** answer: my hand. Empty in every other phase (the TV never needs it, the phone only then). */
  hand: { id: string; text: string }[];
  /** answer: new hands I may still take this game (0 once used up, or after playing). */
  redrawsLeft: number;
  /** My cards this round, in blank order; null until the server accepted a play. */
  myPlay: string[] | null;
  playedCount: number;
  playersExpected: number;
  cards: CardView[];
  revealIndex: number;
  cardCount: number;
  /** judge: what this phone may do. `mySlot` is my own card (not votable). */
  vote: { canVote: boolean; mySlot: number | null; votedSlot: number | null } | null;
  /** I-149 A: the side bet, for a phone that is not the judge (null for the judge and in vote mode). */
  guess: { canGuess: boolean; mySlot: number | null; guessedSlot: number | null } | null;
  votedCount: number;
  votersExpected: number;
  revealed: RevealedCard[];
  winnerIds: string[];
  walkover: boolean;
  iWon: boolean;
  myScore: number;
  myRank: number;
  standings: StandingsRow[];
  /** intro: somebody has won two or more rounds in a row. */
  streak: StreakView | null;
  /** final + done: the card of the night, so a phone sees the payoff the TV shows. */
  bestCard: BestCardView | null;
}

function statusOf(state: State): (id: string) => PlayerStatus {
  const phase = state.phase.id;
  return (id) => {
    if (phase === 'pick') return isCzar(state, id) ? 'active' : 'waiting';
    if (phase === 'answer') {
      if (isCzar(state, id) || sitsOut(state, id)) return 'waiting'; // I-147 A
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
  if (allIn(state) || votesIn(state)) return 'hidden';
  if (phase === 'intro' || phase === 'reveal' || phase === 'final') return 'quiet';
  return !state.settings.timed && untimed ? 'hidden' : 'normal';
}

function votersExpected(state: State): number {
  return eligibleVoters(state).filter(
    (id) => state.players[id]?.connected && hasVotableSlot(state, id),
  ).length;
}

/** The seat asked to read, while their phone is still in the room: a reader who dropped
 *  mid-reading leaves the room the plain "Read it out loud" instead of a name nobody can answer
 *  to (review-loop #397). */
/** I-143 B: there is no seat left that could read a card out loud. */
function everyoneIsABot(state: State): boolean {
  return Object.values(state.players).every((p) => p.bot === true || !p.connected);
}

function reader(state: State): PersonView | null {
  const p = person(state, state.readerId);
  return p?.connected ? p : null;
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
    ...skipLabel(state), // I-774 B
    round: state.round,
    tieBreak: state.tied ?? null,
    rounds: state.settings.rounds,
    judgeMode: state.settings.judge,
    timed: state.settings.timed,
    czar: person(state, state.czarId),
    judgeGone: state.judgeGone ?? null,
    calledIt: calledIt(state),
    reader: phase === 'reveal' ? reader(state) : null,
    everyoneIsABot: everyoneIsABot(state),
    ...voiceView(state),
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
    streak: phase === 'intro' ? streakView(state) : null,
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
    ...skipLabel(state), // I-774 B
    round: state.round,
    rounds: state.settings.rounds,
    judgeMode: state.settings.judge,
    timed: state.settings.timed,
    czar: person(state, state.czarId),
    ...voiceView(state),
    reader: phase === 'reveal' ? reader(state) : null,
    readingOpen: player && readingOpen(state) && state.players[playerId]?.connected === true,
    black: blackView(state),
    blackChoices: blackChoices(state),
    role: !player ? 'spectator' : isCzar(state, playerId) ? 'judge' : 'player',
    sitsOut: phase === 'answer' && !!player && sitsOut(state, playerId),
    // The judge keeps their hand for later rounds but has nothing to play now: no list.
    // I-148 A: the hand also travels during "pick", so the wait can be spent reading it. The
    // judge is still excluded, and nothing is playable until the answer phase opens.
    hand:
      (phase === 'answer' || phase === 'pick') &&
      player &&
      !isCzar(state, playerId) &&
      !sitsOut(state, playerId)
        ? (state.hands[playerId] ?? []).map((id) => ({ id, text: whiteText(id) }))
        : [],
    redrawsLeft:
      phase === 'answer' && player && !isCzar(state, playerId) && !sitsOut(state, playerId) && !mine
        ? redrawsLeft(state, playerId)
        : 0,
    myPlay: mine && phase !== 'intro' ? mine.map(whiteText) : null,
    playedCount: playedCount(state),
    playersExpected: playersExpected(state),
    cards: stageCards(state),
    revealIndex: phase === 'reveal' ? state.revealIndex : -1,
    cardCount: state.slots.length,
    guess:
      phase === 'judge' && player && state.settings.judge === 'czar' && !isCzar(state, playerId)
        ? {
            canGuess: !judgePicked(state),
            mySlot: state.slots.findIndex((id) => id === playerId),
            guessedSlot: state.guesses?.[playerId] ?? null,
          }
        : null,
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
    streak: phase === 'intro' ? streakView(state) : null,
    bestCard: phase === 'final' || phase === 'done' ? bestCardView(state) : null,
  };
}

/** I-149 B: the players whose call matched the card the judge took. */
function calledIt(state: State): { name: string; avatarId: string }[] {
  if (state.phase.id !== 'result' || state.winners.length === 0) return [];
  return Object.entries(state.guesses ?? {})
    .filter(([, slot]) => state.winners.includes(state.slots[slot] ?? ''))
    .map(([id]) => ({
      name: state.players[id]?.name ?? '',
      avatarId: state.players[id]?.avatarId ?? 'ghost',
    }));
}

/** READER-VOICES: the reading that belongs to this moment — the question while answers come in,
 *  the card on stage during the reading — once the host has made it. */
function voiceView(state: State): Voice {
  const voice = voiced(state);
  const slot =
    state.phase.id === 'reveal'
      ? state.revealIndex
      : state.phase.id === 'answer'
        ? null
        : undefined;
  const reading = voice && slot !== undefined ? readingFor(state, slot) : null;
  const ms = reading ? state.speech?.[reading.key] : undefined;
  return {
    voice,
    speech:
      reading && ms !== undefined && ms >= 0
        ? { key: reading.key, url: `/api/speech/${reading.key}.wav` }
        : null,
  };
}

/** I-774 B: during the reading, the VIP's Next is "the next card" — the button says so. */
function skipLabel(state: State): { vipSkipLabel?: string } {
  if (state.phase.id !== 'reveal') return {};
  const n = state.slots.length;
  const next = state.revealIndex + 2;
  return { vipSkipLabel: next <= n ? `Next card (${next} of ${n})` : 'Open the vote' };
}
