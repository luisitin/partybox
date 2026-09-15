// Phase "reveal": scores the question on entry (so views and results agree), shows the answer for
// 5 s, then `next` decides what follows (next question, the wager, or done — wired in index.ts).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { scoreCurrentQuestion } from '../scoring';
import { REVEAL_MS } from '../types';
import type { Input, State } from '../types';
import type { Advance } from './intro';

export function enterReveal(state: State, now: number): State {
  return enterPhase(scoreCurrentQuestion(state), 'reveal', now, REVEAL_MS);
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}

export function reduceReveal(state: State, event: GameEvent<Input>, next: Advance): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
