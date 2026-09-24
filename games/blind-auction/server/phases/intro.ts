// Phase "intro" (once): the title, the three steps, "Everyone starts with 100". 8 s or the VIP.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { INTRO_MS } from '../timing';
import type { Input, State, Transition } from '../types';

export function enterIntro(state: State, now: number): State {
  return enterPhase(state, 'intro', now, INTRO_MS);
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
