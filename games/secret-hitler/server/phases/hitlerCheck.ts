// Phase "hitlerCheck" (R8, D5): a government elected with 3+ Fascist policies enacted. Hitler as
// Chancellor wins for the Fascists at once; anyone else is marked ✓ Not Hitler for the game.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go, headlined } from '../phase';
import { REVEAL_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterHitlerCheck(state: State, now: number): State {
  const chancellor = state.round.nominee ?? '';
  const s: State =
    state.role[chancellor] === 'hitler'
      ? { ...state, winner: 'fascists', winReason: 'hitlerElected' }
      : { ...state, notHitler: [...new Set([...state.notHitler, chancellor])] };
  return go(
    headlined(s, s.winner ? 'hitlerElected' : 'notHitler'),
    'hitlerCheck',
    now,
    REVEAL_MS.hitlerCheck,
  );
}

export function reduceHitlerCheck(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
