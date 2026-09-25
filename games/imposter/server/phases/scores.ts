// Phase "scores": the round's points land (scores never go down) and the board climbs; 8 s, or
// the VIP's Next round / See results. Also the terminal "done".
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { roundStats } from '../scoring';
import { SCORES_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterScores(state: State, now: number): State {
  const scores = { ...state.scores };
  for (const [id, d] of Object.entries(state.round.delta))
    scores[id] = (scores[id] ?? 0) + Math.max(0, d.pts);
  return enterPhase({ ...state, scores, stats: roundStats(state) }, 'scores', now, SCORES_MS);
}

export function reduceScores(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}
