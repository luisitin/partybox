// Phase "vote" (R7, D2): every living player votes Ja or Nein in secret and may change it until
// the phase ends. Ends early once every living player has voted, else at the deadline.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go, timed, withRound } from '../phase';
import type { Input, State, Transition } from '../types';

export function enterVote(state: State, now: number): State {
  return go(withRound(state, { votes: {} }), 'vote', now, timed(state, 'vote'));
}

export function everyoneVoted(state: State): boolean {
  return state.alive.every((id) => Object.hasOwn(state.round.votes, id));
}

export function reduceVote(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input' && event.input.type === 'vote') {
    const id = event.playerId;
    if (!state.alive.includes(id)) return state;
    if (state.round.votes[id] === event.input.ja && Object.hasOwn(state.round.votes, id))
      return state;
    const after = withRound(state, { votes: { ...state.round.votes, [id]: event.input.ja } });
    return everyoneVoted(after) ? next(after, event.now) : after;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
