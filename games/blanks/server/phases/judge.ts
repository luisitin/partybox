// Phase "judge": every card is up, anonymous; the room votes (vote mode) or the judge picks
// (czar mode). Nobody can vote for their own card. Exits when every connected eligible voter
// has voted, on Next from any player (untimed rounds — but never past a connected judge, whose
// pick is the whole phase), on the deadline (30 s / 45 s for a judge, a hidden 2 min fallback
// when untimed), or on VIP skip (votes so far count).
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { canVote, votingDone } from '../round';
import { BIG_JUDGE_MS, BIG_ROOM, JUDGE_CZAR_MS, JUDGE_VOTE_MS, UNTIMED_JUDGE_MS } from '../types';
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

/** Untimed czar mode: only a dropped judge lets the room move on without a pick. */
export function judgeBlocksNext(state: State): boolean {
  if (state.settings.judge !== 'czar' || state.czarId === null) return false;
  return state.players[state.czarId]?.connected === true;
}

export function reduceJudge(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (event.input.type === 'next')
      return !state.settings.timed && hasPlayer(state, event.playerId) && !judgeBlocksNext(state)
        ? next(state, event.now)
        : state;
    if (event.input.type !== 'vote') return state;
    const after = applyVote(state, event.playerId, event.input);
    if (after === state) return state;
    return allConnectedDone(after, votingDone(after)) ? next(after, event.now) : after;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
