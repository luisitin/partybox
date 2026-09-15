// Phase "reveal": the TV shows every answer for a few seconds; scores are locked in on entry.
// Exits on the deadline (or VIP skip) into "done", where results() becomes non-null.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { scoreAnswers } from '../scoring';
import { REVEAL_MS } from '../types';
import type { Input, State } from '../types';

export function enterReveal(state: State, now: number): State {
  const scored: State = { ...state, scores: scoreAnswers(state) };
  return enterPhase(scored, 'reveal', now, REVEAL_MS);
}

export function enterDone(state: State, now: number): State {
  // VIP "end" straight from "answer" skips the reveal, but answers submitted so far still count
  // (README "Edge cases"); scores are otherwise locked in by enterReveal.
  const scored = state.phase.id === 'answer' ? { ...state, scores: scoreAnswers(state) } : state;
  return enterPhase(scored, 'done', now, null);
}

export function reduceReveal(state: State, event: GameEvent<Input>): State {
  if (isTimerFor(state, event)) return enterDone(state, event.now);
  return state;
}
