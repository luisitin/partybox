// Phase "scores": the scoreboard with this question's points and reason chips (6 s); the VIP's
// "Next question" / "See results" skips it. Then the next question, or "done" (results non-null).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { SCORES_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterScores(state: State, now: number): State {
  return enterPhase(state, 'scores', now, SCORES_MS);
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}

export function isLastQuestion(state: State): boolean {
  return state.q.n >= state.cfg.questions;
}

export function reduceScores(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
