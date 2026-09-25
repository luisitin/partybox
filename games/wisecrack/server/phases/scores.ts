// Phase "scores": the round scoreboard with deltas — between rounds it waits for the VIP's Next
// (45 s fallback; pacing rule 2026-09-25, was 8 s); after the last round it is the drumroll, timed
// to read every row. Then the next round or "done", the terminal phase where results() becomes
// non-null. VIP end jumps to "done" from anywhere.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { isLastRound } from '../round';
import { SCORES_FINAL_MIN_MS, SCORES_MS, readMs } from '../types';
import type { Input, State } from '../types';
import type { Transition } from './intro';

export function enterScores(state: State, now: number): State {
  const players = Object.keys(state.players).length;
  const ms = isLastRound(state)
    ? Math.max(SCORES_FINAL_MIN_MS, readMs(8 + 3 * players))
    : SCORES_MS;
  return enterPhase(state, 'scores', now, ms);
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}

export function reduceScores(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
