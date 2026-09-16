// Phase "guess" (the last step, `guessSeconds`): the final holder of each book only guesses — a
// drawing here would come back to the owner. Mirrors phases/draw.ts; step logic in ../step.ts.
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
