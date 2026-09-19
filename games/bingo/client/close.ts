// "One to go" (loop 420): the squares that would finish the pattern from what the player has
// daubed — their own marks, not the called list, so a missed number stays theirs to notice. A hall
// player says "waiting!" at this moment; the phone leans in for them instead.
import { completions } from '../server/patterns';
import type { Pattern } from '../server/types';

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
