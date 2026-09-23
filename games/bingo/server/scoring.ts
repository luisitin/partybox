// Scoring for Bingo (owner, 2026-09-17): under each pattern of a round the 1st bingo is worth 3
// points, the 2nd 2, the 3rd 1, every one after that ½ — and a switch to blackout starts the ladder
// again (3, 2, 1, ½). Ties share the rank. I-401: awards from the game's own history.
import { buildResults, rank } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import type { State } from './types';

export interface StandingRow {
  playerId: string;
  name: string;
  /** Points (the name is older than the ladder: one bingo was one point once). */
  wins: number;
  /** Points gained this round (the scoreboard lands them as a delta, then counts up). */
  delta: number;
  rank: number;
}

/** Points for the n-th bingo under a pattern this round: 3, 2, 1, then ½ each. */
export function pointsFor(nth: number): number {
  return [3, 2, 1][nth - 1] ?? 0.5;
}

/** Points, ranked (shared ranks for ties), for the scoreboard and the final screen. */
export function standings(state: State): StandingRow[] {
  const scores: Record<string, number> = {};
  for (const id of Object.keys(state.players)) scores[id] = state.wins[id] ?? 0;
  return rank(scores).map((row) => ({
    playerId: row.playerId,
    name: state.players[row.playerId]?.name ?? '?',
    wins: row.score,
    delta: row.score - (state.winsAtRoundStart[row.playerId] ?? 0),
    rank: row.rank,
  }));
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.wins, awards(state));
}

/** I-401: Bingo's awards — the fastest bingo and a clean win. */
export function awards(state: State): GameAward[] {
  const out: GameAward[] = [];
  const wins = state.history.filter((h) => h.winnerId !== null);
  const fastest = wins.reduce<(typeof wins)[number] | null>(
    (best, h) => (!best || h.calls < best.calls ? h : best),
    null,
  );
  if (fastest?.winnerId)
    out.push({
      id: 'quick-draw',
      title: 'Quick draw',
      description: `Bingo on call ${fastest.calls}`,
      playerId: fastest.winnerId,
    });
  const clean: Record<string, number> = {};
  for (const h of wins) if (h.clean && h.winnerId) clean[h.winnerId] = (clean[h.winnerId] ?? 0) + 1;
  const tidy = Object.entries(clean).sort((a, b) => b[1] - a[1])[0];
  if (tidy)
    out.push({
      id: 'clean-card',
      title: 'Clean card',
      description: tidy[1] === 1 ? 'Won with no stray daubs' : `${tidy[1]} wins with no stray daubs`,
      playerId: tidy[0],
    });
  return out;
}
