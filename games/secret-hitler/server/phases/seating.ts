// Phase "seating": everyone reads their dossier (R2) and taps Got it. Ends when every connected
// seat is ready, or after 30 s at normal pace (D1: the game continues either way).
import { hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go, timed } from '../phase';
import type { Input, State, Transition } from '../types';

export function enterSeating(state: State, now: number): State {
  return go(state, 'seating', now, timed(state, 'seating'));
}

export function allReady(state: State): boolean {
  const waiting = state.alive.filter((id) => state.players[id]?.connected);
  return waiting.length > 0 && waiting.every((id) => state.ready.includes(id));
}

export function reduceSeating(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input' && event.input.type === 'ready') {
    const id = event.playerId;
    if (!hasPlayer(state, id) || !state.alive.includes(id) || state.ready.includes(id))
      return state;
    const after = { ...state, ready: [...state.ready, id] };
    return allReady(after) ? next(after, event.now) : after;
  }
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
