// Scoring helpers shared by games: rankings with shared ranks for ties, results assembly, and
// speed-scaled points. Pure; safe inside reducers.
import type { GameAward, GameResults, GameStateBase } from '@partybox/shared';
import { compareCodeUnits } from './compare';

export interface RankedRow {
  playerId: string;
  score: number;
  rank: number;
}

/** Highest score first; equal scores share a rank ("1, 2, 2, 4"); ties broken by id for stability. */
export function rank(scores: Record<string, number>): RankedRow[] {
  const rows = Object.entries(scores)
    .map(([playerId, score]) => ({ playerId, score: Number.isFinite(score) ? score : 0, rank: 0 }))
    .sort((a, b) => b.score - a.score || compareCodeUnits(a.playerId, b.playerId));
  let lastScore: number | null = null;
  let lastRank = 0;
  rows.forEach((row, index) => {
    if (row.score !== lastScore) {
      lastRank = index + 1;
      lastScore = row.score;
    }
    row.rank = lastRank;
  });
  return rows;
}

/** Every player from `state.players` gets a finite score (missing → 0), as the contract requires. */
export function buildResults(
  state: GameStateBase,
  scores: Record<string, number>,
  awards: GameAward[] = [],
): GameResults {
  const complete: Record<string, number> = {};
  for (const id of Object.keys(state.players)) {
    const value = scores[id];
    complete[id] = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }
  const ranking = rank(complete);
  return {
    scores: complete,
    ranking,
    winnerIds: ranking.filter((r) => r.rank === 1).map((r) => r.playerId),
    awards: awards.filter((a) => a.playerId in state.players),
  };
}

/**
 * Points for answering `elapsedMs` into a `windowMs` phase: `max` at 0 ms falling linearly to `min`
 * at the deadline. Always an integer, never below `min`.
 */
export function speedPoints(elapsedMs: number, windowMs: number, max: number, min = 0): number {
  if (windowMs <= 0) return max;
  const fraction = Math.min(1, Math.max(0, elapsedMs / windowMs));
  return Math.round(max - (max - min) * fraction);
}

/** Sums two score maps. */
export function addScores(
  a: Record<string, number>,
  b: Record<string, number>,
): Record<string, number> {
  const out = { ...a };
  for (const [id, value] of Object.entries(b)) out[id] = (out[id] ?? 0) + value;
  return out;
}
