// Results and the four awards (SPEC §6.6): Queen Bee, Hive Mind, Odd Bug, Twin Brains. An award
// nobody earned is skipped; ties share it. English here; the phones translate (client/strings).
import { buildResults } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import type { Stat, State } from './types';

const ZERO: Stat = { exact: 0, queens: 0, lows: 0, perfects: 0 };

function most(state: State, value: (s: Stat) => number): { ids: string[]; best: number } {
  const rows = Object.keys(state.players).map(
    (id) => [id, value(state.stats[id] ?? ZERO)] as const,
  );
  const best = Math.max(0, ...rows.map(([, v]) => v));
  return { ids: best > 0 ? rows.filter(([, v]) => v === best).map(([id]) => id) : [], best };
}

function times(n: number, one: string, many: string): string {
  return n === 1 ? one : many.replace('{n}', String(n));
}

export function awards(state: State): GameAward[] {
  const out: GameAward[] = [];
  const add = (id: string, title: string, description: string, playerId: string): void => {
    out.push({ id: `${id}:${playerId}`, title, description, playerId });
  };
  const queen = most(state, (s) => s.queens);
  for (const id of queen.ids)
    add(
      'queen',
      '👑 Queen Bee',
      times(queen.best, 'Top scorer in 1 round', 'Top scorer in {n} rounds'),
      id,
    );
  const mind = most(state, (s) => s.exact);
  for (const id of mind.ids)
    add(
      'mind',
      '🎯 Hive Mind',
      times(mind.best, '1 thing in the hive’s exact spot', '{n} things in the hive’s exact spot'),
      id,
    );
  const odd = most(state, (s) => s.lows);
  for (const id of odd.ids)
    add(
      'odd',
      '🦗 Odd Bug',
      times(odd.best, 'The round’s lowest score once', 'The round’s lowest score {n} times'),
      id,
    );
  const pairs = Object.entries(state.pairs).filter(([key]) =>
    key.split('|').every((id) => Object.hasOwn(state.players, id)),
  );
  const twin = Math.max(0, ...pairs.map(([, n]) => n));
  if (twin > 0)
    for (const [key, n] of pairs) {
      if (n !== twin) continue;
      const [a = '', b = ''] = key.split('|');
      const line = times(
        n,
        '1 thing in the same spot as {name}',
        '{n} things in the same spot as {name}',
      );
      add('twins', '🧠 Twin Brains', line.replace('{name}', state.players[b]?.name ?? '?'), a);
      add('twins', '🧠 Twin Brains', line.replace('{name}', state.players[a]?.name ?? '?'), b);
    }
  // One Twin Brains per player: the first pair a player is in wins the line.
  const seen = new Set<string>();
  return out.filter((a) => !seen.has(a.id) && seen.add(a.id) !== undefined);
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, state.scores, awards(state));
}
