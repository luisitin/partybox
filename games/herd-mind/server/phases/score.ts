// Phase "score": +1 over the herd, the Black Sheep flies to its new holder, the race track moves.
// Exits after SCORE_MS (WIN_MS when someone won) or the VIP's Next question; then the next
// question, or `done`.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { scoreQuestion, winnersOf } from '../scoring';
import { SCORE_MS, WIN_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterScore(state: State, now: number): State {
  const scored = scoreQuestion(state);
  return enterPhase(scored, 'score', now, scored.winners.length > 0 ? WIN_MS : SCORE_MS);
}

export function reduceScore(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

/** The end: an early end (VIP) still settles the winners, so the sheep holder never wins. */
export function enterDone(state: State, now: number): State {
  const winners = state.winners.length > 0 ? state.winners : winnersOf(state, true);
  return enterPhase({ ...state, winners }, 'done', now, null);
}
