// Phase "gameOver" (R22): every role is revealed on the TV; 15 s or the VIP's Next, then `done`,
// where results() is non-null.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go, headlined } from '../phase';
import { REVEAL_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterGameOver(state: State, now: number): State {
  // The ending's own front page; a game that ended some other way keeps the last headline.
  const s = state.winReason ? headlined(state, state.winReason) : state;
  return go(s, 'gameOver', now, REVEAL_MS.gameOver);
}

export function reduceGameOver(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

export function enterDone(state: State, now: number): State {
  return go(state, 'done', now, null);
}
