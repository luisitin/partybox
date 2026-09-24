// Patterns and claim checking. A pattern is a list of "completions" (sets of card indices); a claim
// is valid when some completion is entirely green (daubed AND called). FREE always counts.
import { FREE } from './types';
import type { Claim, Pattern } from './types';

export const PATTERN_LABEL: Record<Pattern, string> = {
  line: 'Any line',
  corners: 'Four corners',
  x: 'The X',
  blackout: 'Blackout',
  frame: 'Picture frame', // I-093 A
  stamp: 'Postage stamp',
  tee: 'The T', // I-093 B
};

export const PATTERN_HINT: Record<Pattern, string> = {
  line: 'Five in a row — across, down or diagonal. FREE counts.',
  corners: 'The four corner squares.',
  x: 'Both diagonals, corner to corner.',
  blackout: 'Every square on the card. Settle in.',
  frame: 'The outer ring — all sixteen edge squares.',
  stamp: 'Any 2×2 block in a corner of the card.',
  tee: 'The top row and the middle column.',
};

const ROWS = [0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => r * 5 + c));
const COLS = [0, 1, 2, 3, 4].map((c) => [0, 1, 2, 3, 4].map((r) => r * 5 + c));
const DIAG_A = [0, 6, 12, 18, 24];
const DIAG_B = [4, 8, 12, 16, 20];
const ALL = Array.from({ length: 25 }, (_, i) => i);

const COMPLETIONS: Record<Pattern, readonly (readonly number[])[]> = {
  line: [...ROWS, ...COLS, DIAG_A, DIAG_B],
  corners: [[0, 4, 20, 24]],
  x: [[...DIAG_A, 4, 8, 16, 20]],
  blackout: [ALL],
  // I-093 A: the ring, and the four corner blocks (any one wins).
  frame: [[0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24]],
  stamp: [
    [0, 1, 5, 6],
    [3, 4, 8, 9],
    [15, 16, 20, 21],
    [18, 19, 23, 24],
  ],
  tee: [[0, 1, 2, 3, 4, 7, 12, 17, 22]], // I-093 B
};

export function completions(pattern: Pattern): readonly (readonly number[])[] {
  return COMPLETIONS[pattern];
}

/**
 * What the pattern icon highlights (and the phone outlines): every cell the pattern needs — except
 * `line`, where "every line" would fill the grid, so one example row stands for it.
 */
/**
 * True when the pattern is "any one of several shapes" (any line, any corner block): no single
 * set of cells IS the pattern, so a card must not outline one as if it were (2026-09-22 — the
 * Postage stamp's card outlined only the top-left block while any corner wins).
 */
export function isAnyOf(pattern: Pattern): boolean {
  return completions(pattern).length > 1;
}

export function patternCells(pattern: Pattern): number[] {
  if (pattern === 'line') return [...(ROWS[2] as number[])];
  if (pattern === 'stamp') return [0, 1, 5, 6]; // I-093 C: one example block stands for "any corner"
  const set = new Set<number>();
  for (const cells of completions(pattern)) for (const i of cells) set.add(i);
  return [...set].sort((a, b) => a - b);
}

/** True when some completion is fully daubed on the phone (what a player sees before pressing). */
export function looksComplete(pattern: Pattern, daubs: readonly number[]): boolean {
  const d = new Set(daubs);
  return completions(pattern).some((cells) => cells.every((i) => i === FREE || d.has(i)));
}

/**
 * The verdict. `red` = every daubed square whose number was never called (anywhere on the card);
 * the completion shown is the one with the most green squares; valid iff it is entirely green.
 */
export function evaluate(
  playerId: string,
  cardIndex: number,
  card: readonly number[],
  daubs: readonly number[],
  called: readonly number[],
  pattern: Pattern,
): Claim {
  const d = new Set([...daubs, FREE]);
  const c = new Set([...called, 0]);
  const red = card.map((_, i) => i).filter((i) => d.has(i) && !c.has(card[i] as number));
  // I-392 A: judge the line the player bet on — the most DAUBED cells, ties to the most called.
  // (By called cells alone, FREE made any line through the centre beat a daubed line of misses.)
  let best: { cells: readonly number[]; green: number[] } = { cells: [], green: [] };
  let bestDaubed = -1;
  for (const cells of completions(pattern)) {
    const daubed = cells.filter((i) => d.has(i)).length;
    const green = cells.filter((i) => d.has(i) && c.has(card[i] as number));
    if (daubed > bestDaubed || (daubed === bestDaubed && green.length > best.green.length)) {
      bestDaubed = daubed;
      best = { cells, green };
    }
  }
  const missing = best.cells.filter((i) => !d.has(i));
  return {
    playerId,
    cardIndex,
    daubs: [...daubs],
    cells: [...best.cells],
    green: best.green,
    red,
    missing,
    valid: best.cells.length > 0 && best.green.length === best.cells.length,
  };
}
