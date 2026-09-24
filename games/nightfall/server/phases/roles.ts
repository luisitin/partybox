// Phase "roles": every phone holds its SecretCard; the TV shows the public role list. Exits when
// every connected player tapped "Got it", after 20 s, or on the VIP's skip.
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { ROLES_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterRoles(state: State, now: number): State {
  return enterPhase({ ...state, ready: [], step: 0, stepAt: now }, 'roles', now, ROLES_MS);
}

export function reduceRoles(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  if (!hasPlayer(state, event.playerId) || state.ready.includes(event.playerId)) return state;
  const after: State = { ...state, ready: [...state.ready, event.playerId] };
  return allConnectedDone(after, after.ready) ? next(after, event.now) : after;
}
