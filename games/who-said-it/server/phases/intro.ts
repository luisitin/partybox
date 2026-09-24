// Phase "intro" (once): the title and the three steps. Exits on the 8 s deadline or VIP skip.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { INTRO_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterIntro(state: State, now: number): State {
  return enterPhase(state, 'intro', now, INTRO_MS);
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
