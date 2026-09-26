// Phase "claims": the table talks about the session. M1 keeps it a timed "Discuss" beat (60 s at
// normal pace, or the VIP's Next); the claim builder and the Record arrive in M2 (SPEC §10).
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go, timed } from '../phase';
import type { Input, State, Transition } from '../types';

export function enterClaims(state: State, now: number): State {
  return go(state, 'claims', now, timed(state, 'claims'));
}

export function reduceClaims(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
