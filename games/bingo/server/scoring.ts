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

/** The one player holding the top count (at least 1), or null — a tie gives nobody the award
 *  (the owner's note on I-401: only an earned award shows; ties and no trigger mean none). */
function soleTop(counts: Readonly<Record<string, number>>): [string, number] | null {
  const rows = Object.entries(counts).filter(([, n]) => n > 0);
  const top = Math.max(0, ...rows.map(([, n]) => n));
  const leaders = rows.filter(([, n]) => n === top);
  return top > 0 && leaders.length === 1 ? (leaders[0] ?? null) : null;
}

/** I-401: Bingo's awards — the fastest bingo and a clean win (A), and the most wrong claims (B). */
export function awards(state: State): GameAward[] {
  const out: GameAward[] = [];
  const wins = state.history.filter((h) => h.winnerId !== null);
  // Quick draw: the fewest calls to a bingo, held by one player only
  const fewest = Math.min(Infinity, ...wins.map((h) => h.calls));
  const fastest = new Set(wins.filter((h) => h.calls === fewest).map((h) => h.winnerId));
  const quick = fastest.size === 1 ? [...fastest][0] : null;
  if (quick)
    out.push({
      id: 'quick-draw',
      title: 'Quick draw',
      description: `Bingo on call ${fewest}`,
      playerId: quick,
    });
  const clean: Record<string, number> = {};
  for (const h of wins) if (h.clean && h.winnerId) clean[h.winnerId] = (clean[h.winnerId] ?? 0) + 1;
  const tidy = soleTop(clean);
  if (tidy)
    out.push({
      id: 'clean-card',
      title: 'Clean card',
      description:
        tidy[1] === 1 ? 'Won with no stray daubs' : `${tidy[1]} wins with no stray daubs`,
      playerId: tidy[0],
    });
  const wrong = soleTop(state.wrongClaims ?? {});
  if (wrong)
    out.push({
      id: 'trigger-finger',
      title: 'Trigger finger',
      description: wrong[1] === 1 ? '1 wrong BINGO!' : `${wrong[1]} wrong BINGO!s`,
      playerId: wrong[0],
    });
  return out;
}
