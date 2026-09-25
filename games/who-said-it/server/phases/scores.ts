// Phase "scores": the board with this prompt's deltas ("Nobody answered!" when no card was made).
// Exits on the 6 s deadline or VIP skip (the phone's Next prompt / See results). "done" is terminal.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { SCORES_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterScores(state: State, now: number): State {
  return enterPhase(state, 'scores', now, SCORES_MS);
}

export function reduceScores(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}
