// Phase "draw" (`drawSeconds`): draw the text on the previous page of the book in your hands.
// The step logic lives in ../step.ts (draw and guess alternate); `next` is what closing the step
// leads to — the next step, or the show after the last page.
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { applyStepInput, closeStep, enterStep } from '../step';
import type { Input, State, Transition } from '../types';

export function enterDraw(state: State, now: number): State {
  return enterStep(state, now);
}

export function reduceDraw(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input')
    return applyStepInput(state, event.playerId, event.input, event.now, next);
  if (isTimerFor(state, event)) return closeStep(state, event.now, next);
  return state;
}
