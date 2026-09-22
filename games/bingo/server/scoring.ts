// Scoring for Bingo (owner, 2026-09-17): under each pattern of a round the 1st bingo is worth 3
// points, the 2nd 2, the 3rd 1, every one after that ½ — and a switch to blackout starts the ladder
// again (3, 2, 1, ½). Ties share the rank; no awards.
import { buildResults, rank } from '@partybox/game-sdk';
import type { GameResults } from '@partybox/game-sdk';
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

/** I-130 B: a round nobody won pays everyone who played one point — the room's unlucky round
 *  is not nothing. */
export function shareRound(state: State): Record<string, number> {
  const out: Record<string, number> = { ...state.wins };
  for (const id of Object.keys(state.round.cards)) out[id] = (out[id] ?? 0) + 1;
  return out;
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.wins);
}
