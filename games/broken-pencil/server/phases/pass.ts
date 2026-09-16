// Phase "pass" (steps 2..P, `guessSeconds + drawSeconds`): the book moved one seat. Its holder
// looks at the last drawing, writes a guess, then draws that guess for the next seat — two pages,
// in that order, on one phone. Mirrors phases/draw.ts; the step logic is in ../step.ts.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { applyStepInput, closeStep, enterStep } from '../step';
import type { Input, State, Transition } from '../types';

export function enterPass(state: State, now: number): State {
  return enterStep(state, now);
}

export function reducePass(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input')
    return applyStepInput(state, event.playerId, event.input, event.now, next);
  if (isTimerFor(state, event)) return closeStep(state, event.now, next);
  return state;
}
