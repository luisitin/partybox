// Phase "judge": every card is up, anonymous; the room votes (vote mode) or the judge picks
// (czar mode). Nobody can vote for their own card. Exits when every connected eligible voter
// has voted, on Next from any player (untimed rounds — but never past a connected judge, whose
// pick is the whole phase), on the deadline (30 s / 45 s for a judge, a hidden 2 min fallback
// when untimed), or on VIP skip (votes so far count).
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { canVote, votingDone } from '../round';
import {
  BIG_JUDGE_MS,
  BIG_ROOM,
  JUDGE_CZAR_MS,
  JUDGE_GRACE_MS,
  JUDGE_VOTE_MS,
  UNTIMED_JUDGE_MS,
  VOTES_IN_MS,
} from '../types';
import type { Input, State, VoteInput } from '../types';
import type { Transition } from './intro';

export function enterJudge(state: State, now: number): State {
  const ms =
    state.settings.judge === 'czar'
      ? JUDGE_CZAR_MS
      : state.slots.length > BIG_ROOM
        ? BIG_JUDGE_MS
        : JUDGE_VOTE_MS;
  return enterPhase(state, 'judge', now, state.settings.timed ? ms : UNTIMED_JUDGE_MS);
}

function applyVote(state: State, voterId: string, input: VoteInput): State {
  if (!hasPlayer(state, voterId) || Object.hasOwn(state.votes, voterId)) return state;
  if (!canVote(state, voterId, input.slot)) return state;
  return { ...state, votes: { ...state.votes, [voterId]: input.slot } };
}

/** Every eligible voter has voted: the stage holds for a beat before the result, the same way the
 *  answer stage holds on "Everyone's in!" — the deadline moves up to now + VOTES_IN_MS (never later
 *  than it already was) and the timer ends the phase (review-loop #228). */
export function holdVotesIn(state: State, now: number): State {
  const deadline = Math.min(state.phase.deadline ?? Infinity, now + VOTES_IN_MS);
  return { ...state, phase: { ...state.phase, deadline } };
}

/** The beat is on: everyone who could vote has, and the phase only waits for its timer. */
export function votesIn(state: State): boolean {
  return (
    state.phase.id === 'judge' && !judgeAway(state) && allConnectedDone(state, votingDone(state))
  );
}

/** Czar mode with the judge dropped before picking: the vote is theirs alone, so the room waits. */
export function judgeAway(state: State): boolean {
  if (state.settings.judge !== 'czar' || state.czarId === null) return false;
  return (
    state.players[state.czarId]?.connected === false && !Object.hasOwn(state.votes, state.czarId)
  );
}

/** The judge dropped: the round used to end at once with no winner, which a locked screen or a
 *  Wi-Fi blip could do to every round (review-loop #351). Now the deadline moves up to now +
 *  JUDGE_GRACE_MS (never later than it already was) and the timer ends the phase if they are
 *  still gone. */
export function holdForJudge(state: State, now: number): State {
  const deadline = Math.min(state.phase.deadline ?? Infinity, now + JUDGE_GRACE_MS);
  return { ...state, phase: { ...state.phase, deadline } };
}

/** The judge is back inside the grace, pick still open: a fresh judge window, as if they had
 *  never left. Anyone else reconnecting, or a judge who already picked, changes nothing. */
export function judgeReturns(state: State, playerId: string, now: number): State {
  if (state.phase.id !== 'judge' || state.settings.judge !== 'czar') return state;
  if (playerId !== state.czarId || Object.hasOwn(state.votes, playerId)) return state;
  const ms = state.settings.timed ? JUDGE_CZAR_MS : UNTIMED_JUDGE_MS;
  return { ...state, phase: { ...state.phase, deadline: now + ms } };
}

export function reduceJudge(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (event.input.type !== 'vote') return state;
    const after = applyVote(state, event.playerId, event.input);
    if (after === state) return state;
    return allConnectedDone(after, votingDone(after)) ? holdVotesIn(after, event.now) : after;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
