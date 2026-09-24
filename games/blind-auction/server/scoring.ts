// Scoring (SPEC §8.7): your score is your coins at the end; most coins wins, ties share. Five awards,
// each skipped when nobody earned it and shared on a tie.
import { buildResults } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import type { State, Stats } from './types';

interface AwardRule {
  id: string;
  title: string;
  description: string;
  /** The award's measure; null or ≤ 0 = not earned. */
  measure: (s: Stats) => number | null;
}

const AWARDS: AwardRule[] = [
  {
    id: 'high-roller',
    title: '🎲 High Roller',
    description: 'The biggest winning bid',
    measure: (s) => s.biggestBid,
  },
  {
    id: 'bargain-hunter',
    title: '🧾 Bargain Hunter',
    description: 'The best profit on a single lot',
    measure: (s) => s.bestProfit,
  },
  {
    id: 'master-thief',
    title: '🦝 Master Thief',
    description: 'The most coins gained from heists and swaps',
    measure: (s) => s.thief,
  },
  {
    id: 'trap-magnet',
    title: '💀 Trap Magnet',
    description: 'The most coins lost to traps',
    measure: (s) => (s.traps > 0 ? s.trapped : null),
  },
  {
    id: 'big-spender',
    title: '🛍️ Big Spender',
    description: 'The most coins spent on winning bids',
    measure: (s) => s.spent,
  },
];

export function awards(state: State): GameAward[] {
  const out: GameAward[] = [];
  for (const rule of AWARDS) {
    const scored = state.seats
      .map((id) => ({ id, v: state.stats[id] ? rule.measure(state.stats[id]) : null }))
      .filter((x): x is { id: string; v: number } => x.v !== null && x.v > 0);
    if (scored.length === 0) continue;
    const best = Math.max(...scored.map((x) => x.v));
    for (const x of scored)
      if (x.v === best)
        out.push({
          id: `${rule.id}:${x.id}`,
          title: rule.title,
          description: rule.description,
          playerId: x.id,
        });
  }
  return out;
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.coins, awards(state));
}
