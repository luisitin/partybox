// Scoring: your score is your coins at the end; most coins wins, ties share. Five awards, each
// skipped when nobody earned it. One card per award (a play-test: a three-way tie made three cards
// and crowded the results): a tie goes to whoever ends with more coins, then seat order.
import { buildResults } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import type { State, Stats } from './types';

interface AwardRule {
  id: string;
  title: string;
  description: string;
  measure: (s: Stats) => number;
}

const AWARDS: AwardRule[] = [
  {
    id: 'high-roller',
    title: '🎲 High Roller',
    description: 'The biggest single bet',
    measure: (s) => s.biggestBet,
  },
  {
    id: 'big-winner',
    title: '🤑 Big Winner',
    description: 'The biggest single win',
    measure: (s) => s.biggestWin,
  },
  {
    id: 'long-shot',
    title: '🎯 Long Shot',
    description: 'Called a rare one right',
    measure: (s) => s.longShots,
  },
  {
    id: 'fortune-teller',
    title: '🔮 Fortune Teller',
    description: 'The most right calls',
    measure: (s) => s.calls,
  },
  {
    id: 'unlucky',
    title: '💀 Unlucky',
    description: 'The most coins lost on wrong calls',
    measure: (s) => s.lost,
  },
];

export function awards(state: State): GameAward[] {
  const out: GameAward[] = [];
  for (const rule of AWARDS) {
    const scored = state.seats
      .map((id) => ({ id, v: state.stats[id] ? rule.measure(state.stats[id]) : 0 }))
      .filter((x) => x.v > 0);
    if (scored.length === 0) continue;
    const best = Math.max(...scored.map((x) => x.v));
    const tied = scored.filter((x) => x.v === best);
    const coins = (id: string): number => state.coins[id] ?? 0;
    const pick = tied.reduce((a, b) => (coins(b.id) > coins(a.id) ? b : a));
    out.push({
      id: `${rule.id}:${pick.id}`,
      title: rule.title,
      description: rule.description,
      playerId: pick.id,
    });
  }
  return out;
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.coins, awards(state));
}
