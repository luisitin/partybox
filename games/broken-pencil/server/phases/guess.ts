// Phase "guess" (`guessSeconds`): look at the previous page's drawing and write what it is.
// Mirrors phases/draw.ts; the shared step logic is in ../step.ts.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { applyStepInput, closeStep, enterStep } from '../step';
import type { Input, State, Transition } from '../types';

export function enterGuess(state: State, now: number): State {
  return enterStep(state, now);
}

export function reduceGuess(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input')
    return applyStepInput(state, event.playerId, event.input, event.now, next);
  if (isTimerFor(state, event)) return closeStep(state, event.now, next);
  return state;
}
