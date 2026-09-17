// Phase "result": the winning card with its author, every other card's author, and the point.
// Points lock in on entry (exactly once per round). Exits on the 8 s deadline or VIP skip; then
// "done", the terminal phase where results() becomes non-null. VIP end jumps to "done" from anywhere.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { applyRound } from '../scoring';
import { RESULT_MS } from '../types';
import type { Input, State } from '../types';
import type { Transition } from './intro';

export function enterResult(state: State, now: number): State {
  return enterPhase(applyRound(state), 'result', now, RESULT_MS);
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}

export function reduceResult(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
