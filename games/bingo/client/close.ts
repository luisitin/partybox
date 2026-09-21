// "One to go" (loop 420): the rule lives with the server now (R2-01), so the TV view can say who
// is close; the phone keeps importing it from here.
export { wantedCells } from '../server/close';
import { completions } from '../server/patterns';
import type { Pattern } from '../server/types';
/** I-106: how close a card is to a pattern — the fewest undaubed cells over its completions,
 *  and which completion that is (a row / column / diagonal name for a line). */
export function closeness(pattern: Pattern, daubs: readonly number[]): { left: number; where: string } {
  const d = new Set([...daubs, 12]);
  let best = { left: 99, where: '' };
  for (const cells of completions(pattern)) {
    const left = cells.filter((i) => !d.has(i)).length;
    if (left > 0 && left < best.left) best = { left, where: describe(cells) }; // a done line is not "next"
  }
  return best;
}
function describe(cells: readonly number[]): string {
  if (cells.length !== 5) return 'the pattern';
  const rows = new Set(cells.map((i) => Math.floor(i / 5)));
  const cols = new Set(cells.map((i) => i % 5));
  if (rows.size === 1) return `row ${[...rows][0]! + 1}`;
  if (cols.size === 1) return `${'BINGO'[[...cols][0]!]} column`;
  return 'a diagonal';
}

