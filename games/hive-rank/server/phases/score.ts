// Phase "score": each player's points pop, the Queen Bee is crowned, the running scores update.
// The round's points join the totals on entry (scores never go down). Ends after SCORE_MS or on
// the VIP's "Next round" / "See results". Also: "done", the end of the game.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { samePairs } from '../hive';
import { SCORE_MS } from '../types';
import type { Input, Stat, State, Transition } from '../types';

const ZERO: Stat = { exact: 0, queens: 0, lows: 0, perfects: 0 };

/** Adds the round on stage to the totals, once. */
export function applyRound(state: State): State {
  const q = state.q;
  if (q.applied || q.short || !q.hive) return state;
  const scores = { ...state.scores };
  const stats = { ...state.stats };
  for (const [id, d] of Object.entries(q.delta)) {
    scores[id] = (scores[id] ?? 0) + d.pts;
    const s = stats[id] ?? ZERO;
    stats[id] = {
      exact: s.exact + d.exact,
      queens: s.queens + (q.queens.includes(id) ? 1 : 0),
      lows: s.lows + (q.lows.includes(id) ? 1 : 0),
      perfects: s.perfects + (d.perfect ? 1 : 0),
    };
  }
  const pairs = { ...state.pairs };
  for (const [key, same] of Object.entries(samePairs(q.orders)))
    pairs[key] = (pairs[key] ?? 0) + same;
  return { ...state, scores, stats, pairs, q: { ...q, applied: true } };
}

export function enterScore(state: State, now: number): State {
  return enterPhase(applyRound(state), 'score', now, SCORE_MS);
}

export function reduceScore(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}
