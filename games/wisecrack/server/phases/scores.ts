// Phase "scores": the round scoreboard with deltas (8 s), then the next round or "done", the
// terminal phase where results() becomes non-null. VIP end jumps to "done" from anywhere.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { SCORES_MS } from '../types';
import type { Input, State } from '../types';
import type { Transition } from './intro';

export function enterScores(state: State, now: number): State {
  return enterPhase(state, 'scores', now, SCORES_MS);
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}

export function reduceScores(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
