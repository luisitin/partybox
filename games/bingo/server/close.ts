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
