// "One to go" (loop 420), shared by the phone and the TV view (R2-01): the squares that would
// finish the pattern from what a player has daubed — their own marks, not the called list.
import { completions } from './patterns';
import type { Pattern, State } from './types';

const FREE = 12;

/** Cells (sorted) that would complete some line of `pattern` with one more daub; [] otherwise. */
export function wantedCells(pattern: Pattern, daubs: readonly number[]): number[] {
  const d = new Set([...daubs, FREE]);
  const wanted = new Set<number>();
  for (const cells of completions(pattern)) {
    const left = cells.filter((i) => !d.has(i));
    if (left.length === 1) wanted.add(left[0] as number);
  }
  return [...wanted].sort((a, b) => a - b);
}

/** Players with a live card (not already won this pattern) one daub from the pattern. */
export function closePlayers(state: State): string[] {
  if (state.phase.id !== 'play') return [];
  const out: string[] = [];
  for (const [playerId, cards] of Object.entries(state.round.daubs)) {
    const won = state.round.won[playerId] ?? [];
    if (cards.some((d, c) => !won.includes(c) && wantedCells(state.round.pattern, d).length > 0))
      out.push(playerId);
  }
  return out;
}

/** I-135 A: how many daubs a card still needs, and the line it is closest on. */
export function bestLine(
  pattern: Pattern,
  daubs: readonly number[],
): { toGo: number; where: string } | null {
  const d = new Set([...daubs, FREE]);
  let best: { toGo: number; cells: readonly number[] } | null = null;
  for (const cells of completions(pattern)) {
    const toGo = cells.filter((i) => !d.has(i)).length;
    if (best === null || toGo < best.toGo) best = { toGo, cells };
  }
  if (best === null) return null;
  const cols = new Set(best.cells.map((i) => i % 5));
  const rows = new Set(best.cells.map((i) => Math.floor(i / 5)));
  // Only a line has a name worth saying; on Four corners, The X, a frame… the count is the news.
  // (FIRST BUILD: every non-line pattern read "a diagonal" — audit 2026-09-22.)
  const where =
    pattern !== 'line' ? ''
    : cols.size === 1 ? `the ${'BINGO'[[...cols][0] as number]} column`
    : rows.size === 1 ? `row ${([...rows][0] as number) + 1}`
    : 'a diagonal';
  return { toGo: best.toGo, where };
}

/** I-135 A: the room, as the winner's phone shows it while the extension runs. */
export function mates(state: State, meId: string): { id: string; toGo: number; where: string }[] {
  if (state.phase.id !== 'play') return [];
  const out: { id: string; toGo: number; where: string }[] = [];
  for (const [id, cards] of Object.entries(state.round.daubs)) {
    if (id === meId) continue;
    const won = state.round.won[id] ?? [];
    let best: { toGo: number; where: string } | null = null;
    cards.forEach((d, c) => {
      if (won.includes(c)) return;
      const line = bestLine(state.round.pattern, d);
      if (line && (best === null || line.toGo < best.toGo)) best = line;
    });
    if (best !== null) out.push({ id, ...(best as { toGo: number; where: string }) });
  }
  return out.sort((a, b) => a.toGo - b.toGo).slice(0, 6);
}
