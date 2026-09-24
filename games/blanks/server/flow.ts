// The phase graph: intro → (pick, czar mode) → answer → reveal (one instance per card) → judge →
// result → intro | final → done.
// Phase files only know their own entry/exit; this file wires the loop so no phase imports
// another (dependency-cruiser forbids cycles). VIP skip uses the same transitions as a deadline.
import { allConnectedDone, applyVip, setConnected } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { enterAnswer, reduceAnswer } from './phases/answer';
import { enterIntro, reduceIntro } from './phases/intro';
import {
  roomVote,
  enterJudge,
  holdForJudge,
  judgeAway,
  judgeReturns,
  reduceJudge,
} from './phases/judge';
import { enterPick, reducePick } from './phases/pick';
import { applySpeech, enterReveal, reduceReveal } from './phases/reveal';
import { enterDone, enterFinal, enterResult, reduceFinal, reduceResult } from './phases/result';
import { standings } from './scoring';
import { tally, closeAnswers, playersDone, settleBlack, voteIsFormality, votingDone } from './round';
import type { Input, State } from './types';

/** A phase nobody connected can act in ends at once — the judge who dropped during the reading
 *  left the room on "Sam is choosing…" for the whole 2 min fallback (review-loop #142). */
export function afterIntro(state: State, now: number): State {
  if (state.blackChoices.length > 1) return closeIfDone(enterPick(state, now), now);
  return afterPick(state, now);
}

/** The black card is settled (chosen, defaulted or the only one): picking opens. */
export function afterPick(state: State, now: number): State {
  return closeIfDone(enterAnswer(settleBlack(state), now), now);
}

/** Nothing played → straight to the (winnerless) result; one card → walkover, no reading, no
 *  vote; otherwise the reading starts with the first slot. */
export function afterAnswer(state: State, now: number): State {
  const closed = closeAnswers(state);
  if (closed.slots.length <= 1) return enterResult(closed, now);
  return enterReveal(closed, now, 0);
}

export function afterReveal(state: State, now: number): State {
  const index = state.revealIndex + 1;
  if (index < state.slots.length) return enterReveal(state, now, index);
  return voteIsFormality(state)
    ? enterResult(state, now)
    : closeIfDone(enterJudge(state, now), now);
}

export function afterJudge(state: State, now: number): State {
  // I-172 B: three cards split 1-1-1 — the reader breaks the tie, between the two not theirs
  if (splitThree(state)) return readerBreaks(state, now);
  return enterResult(state, now);
}

/** I-172 B: who breaks a split — the round's reader, or (when a voice reads the cards) the
 *  person whose turn it would have been: the rotation, walking past bots and the gone. */
function tieBreaker(state: State): string | null {
  const reader = state.readerId;
  if (reader && state.players[reader]?.connected) return reader;
  const n = state.order.length;
  for (let i = 0; i < n; i += 1) {
    const id = state.order[(state.round - 1 + i) % n] as string;
    const p = state.players[id];
    if (p?.connected && p.bot !== true) return id;
  }
  return null;
}

/** I-172 B: a vote round whose three cards took one vote each, with someone here to break it. */
function splitThree(state: State): boolean {
  if (state.settings.judge !== 'vote' || state.tieBreakBy || state.slots.length !== 3) return false;
  if (tieBreaker(state) === null) return false;
  const rows = tally(state);
  return rows.length === 3 && rows.every((r) => r.votes === 1);
}

/** I-172 B: the round turns to its tie-breaker as judge; startRound puts the vote back. */
function readerBreaks(state: State, now: number): State {
  const reader = tieBreaker(state) as string;
  return enterJudge(
    { ...state, settings: { ...state.settings, judge: 'czar' }, czarId: reader, votes: {}, guesses: {}, tieBreakBy: reader },
    now,
  );
}

/** I-147 A: the ids sharing the top rank after the last round — [] when someone has won it. */
export function tiedAtTop(state: State): string[] {
  const rows = standings(state);
  const top = rows[0];
  if (!top || top.score <= 0) return [];
  const shared = rows.filter((r) => r.score === top.score);
  return shared.length > 1 ? shared.map((r) => r.playerId) : [];
}

const MAX_TIE_BREAKS = 3;

export function afterResult(result: State, now: number): State {
  // I-773: a round the room judged in the judge's place is over — the game is a judge game again,
  // even when it was the last round (the final board and the awards read the judge mode).
  const state: State = result.judgeGone
    ? { ...result, settings: { ...result.settings, judge: 'czar' }, judgeGone: null }
    : result;
  if (state.round < state.settings.rounds) return enterIntro(state, now);
  // I-147 A: the flattest ending the game has, turned into one more card.
  const tied = tiedAtTop(state);
  const may = tied.length > 1 && (state.tieBreaks ?? 0) < MAX_TIE_BREAKS;
  if (!may) return enterFinal({ ...state, tied: null }, now);
  return enterIntro({ ...state, tied, tieBreaks: (state.tieBreaks ?? 0) + 1 }, now);
}

/** "Skip" = what the current phase's deadline would do (reveal: the next card — I-774). */
function skip(state: State, now: number): State {
  switch (state.phase.id) {
    case 'intro':
      return afterIntro(state, now);
    case 'pick':
      return afterPick(state, now);
    case 'answer':
      return afterAnswer(state, now);
    case 'reveal':
      // I-774: the next card, as its own timer would; the last card's Next opens the vote
      return afterReveal(state, now);
    case 'judge':
      return afterJudge(state, now);
    case 'result':
      return afterResult(state, now);
    case 'final':
      return enterDone(state, now);
    default:
      return state;
  }
}

/** The drop of the last outstanding player ends the phase like their input would have: the room
 *  never sits out a full timer for someone who has gone. */
function closeIfDone(state: State, now: number): State {
  // The judge gone: the default card, at once.
  if (state.phase.id === 'pick' && state.czarId !== null && !state.players[state.czarId]?.connected)
    return afterPick(state, now);
  if (state.phase.id === 'answer' && allConnectedDone(state, playersDone(state)))
    return afterAnswer(state, now);
  // The judge gone mid-vote: a grace to come back, not an instant no-winner (review-loop #351).
  if (state.phase.id === 'judge' && judgeAway(state)) return holdForJudge(state, now);
  if (state.phase.id === 'judge' && allConnectedDone(state, votingDone(state)))
    return afterJudge(state, now);
  return state;
}

export function reduce(state: State, event: GameEvent<Input>): State {
  if (event.type === 'player') {
    const after = setConnected(state, event);
    if (after.phase.paused) return after;
    // I-773 B: a judge who left or was removed is not coming back — the room votes now
    if (!event.connected && event.gone && after.phase.id === 'judge' && judgeAway(after))
      return roomVote(after, event.now, event.gone);
    return event.connected
      ? judgeReturns(after, event.playerId, event.now)
      : closeIfDone(after, event.now);
  }
  if (event.type === 'speech') return applySpeech(state, event.key, event.ms, event.now);
  const vip = applyVip(state, event, { skip, end: enterDone });
  if (vip) return vip;
  if (state.phase.paused) return state; // inputs and timers wait while paused
  switch (state.phase.id) {
    case 'intro':
      return reduceIntro(state, event, afterIntro);
    case 'pick':
      return reducePick(state, event, afterPick);
    case 'answer':
      return reduceAnswer(state, event, afterAnswer);
    case 'reveal':
      return reduceReveal(state, event, afterReveal);
    case 'judge':
      return reduceJudge(state, event, afterJudge);
    case 'result':
      return reduceResult(state, event, afterResult);
    case 'final':
      return reduceFinal(state, event, enterDone);
    default:
      return state;
  }
}
