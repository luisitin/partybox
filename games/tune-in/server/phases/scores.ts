// Phase "scores": solo's scoreboard, the teams racing to the target, or co-op's group meter.
// Ends after 6 s or on the VIP's Next round / See results. Also home to "done", the end.
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
