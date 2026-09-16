// Scoring for Bingo: one point per round won, nothing else. Ties share the rank; no awards.
import { buildResults, rank } from '@partybox/game-sdk';
import type { GameResults } from '@partybox/game-sdk';
import type { State } from './types';

export interface StandingRow {
  playerId: string;
  name: string;
  wins: number;
  rank: number;
}

/** Rounds won, ranked (shared ranks for ties), for the scoreboard and the final screen. */
export function standings(state: State): StandingRow[] {
  const scores: Record<string, number> = {};
  for (const id of Object.keys(state.players)) scores[id] = state.wins[id] ?? 0;
  return rank(scores).map((row) => ({
    playerId: row.playerId,
    name: state.players[row.playerId]?.name ?? '?',
    wins: row.score,
    rank: row.rank,
  }));
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.wins);
}
