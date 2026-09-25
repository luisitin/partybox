// Phases "vote" and "runoff": everyone taps the face(s) they suspect, never their own (two picks
// with two imposters; a runoff limits the faces to the tied players). Ends when every connected
// eligible player voted, on the deadline, or on the VIP's skip.
import { connectedIds, enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { eligibleVoters, validVote } from '../votes';
import { RUNOFF_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterVote(state: State, now: number): State {
  return enterPhase(state, 'vote', now, state.cfg.voteSeconds * 1000);
}

export function enterRunoff(state: State, now: number): State {
  return enterPhase(state, 'runoff', now, RUNOFF_MS);
}

function everyoneVoted(state: State, votes: Record<string, string[]>): boolean {
  const connected = new Set(connectedIds(state));
  const need = eligibleVoters(state).filter((id) => connected.has(id));
  return need.length > 0 && need.every((id) => Object.hasOwn(votes, id));
}

export function reduceVote(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'vote') return state;
  const targets = validVote(state, event.playerId, event.input.targets);
  if (!targets) return state;
  const r = state.round;
  let after: State;
  if (state.phase.id === 'runoff' && r.runoff) {
    const votes = { ...r.runoff.votes, [event.playerId]: targets };
    after = { ...state, round: { ...r, runoff: { ...r.runoff, votes } } };
    return everyoneVoted(after, votes) ? next(after, event.now) : after;
  }
  const votes = { ...r.votes, [event.playerId]: targets };
  after = { ...state, round: { ...r, votes } };
  return everyoneVoted(after, votes) ? next(after, event.now) : after;
}
