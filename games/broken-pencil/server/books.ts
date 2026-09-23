// Routing and book helpers shared by the phase files (which never import each other).
//
// Pages of a book: 0 word · 1 the owner's drawing · then (guess, drawing) pairs · a final guess.
// Page i ≥ 1 is written at step ⌊i/2⌋ + 1: step 1 → page 1; step k ≥ 2 → pages 2k−2 (guess) and
// 2k−1 (drawing); the last step P+1 → page 2P (guess only). At step k the book of seat b is with
// seat (b + k − 1) mod N, so seat s holds book (s − k + 1) mod N. Every player works exactly one
// book per step and never the same book twice (P ≤ N − 1).
import type { Book, Page, State } from './types';

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Index of the book in `playerId`'s hands this step, or −1 for spectators. */
export function bookInHands(state: State, playerId: string): number {
  const N = state.seats.length;
  const k = state.seats.indexOf(playerId);
  if (k < 0 || N === 0) return -1;
  return mod(k - state.step + 1, N);
}

/** The step at which page `i` (≥ 1) is written. */
export function stepOfPage(i: number): number {
  return Math.floor(i / 2) + 1;
}

/** Who writes page `i` (≥ 1) of book `b`. */
export function authorOfPage(state: State, b: number, i: number): string {
  const N = state.seats.length;
  return state.seats[mod(b + stepOfPage(i) - 1, N)] as string;
}

/** Page kind for index i: 0 = word, odd = drawing, even = guess. */
export function kindOfPage(i: number): Page['kind'] {
  return i === 0 ? 'word' : i % 2 === 1 ? 'draw' : 'guess';
}

/** Page indices written at `step` (1 or 2 of them). */
export function pagesOfStep(state: State, step: number): number[] {
  if (step <= 0) return [];
  if (step === 1) return [1];
  const guess = 2 * step - 2;
  return guess + 1 < state.pageCount ? [guess, guess + 1] : [guess];
}

/** Pages the book in `playerId`'s hands should have once this step is fully done. */
export function targetLength(state: State): number {
  const pages = pagesOfStep(state, state.step);
  return pages.length === 0 ? 1 : (pages[pages.length - 1] as number) + 1;
}

/** Has `playerId` finished this step (every page it owes is in)? */
export function submittedThisStep(state: State, playerId: string): boolean {
  const b = bookInHands(state, playerId);
  if (b < 0) return false;
  return (state.books[b]?.pages.length ?? 0) >= targetLength(state);
}

/** What `playerId` still owes this step: 'guess', 'draw' or null when done / not playing. */
export function owedNow(state: State, playerId: string): 'guess' | 'draw' | null {
  const b = bookInHands(state, playerId);
  if (b < 0) return null;
  const have = state.books[b]?.pages.length ?? 0;
  if (have >= targetLength(state)) return null;
  return kindOfPage(have) === 'draw' ? 'draw' : 'guess';
}

/** Lower-case, accents folded, punctuation and extra spaces out, a leading article dropped. */
export function normalizeText(text: string): string {
  // Accents fold to their letter (Spanish phones, 2026-09-22: "árbol" and "arbol" are one guess —
  // before, the á became a gap and "rbol" broke the chain), and a leading Spanish article drops
  // like an English one.
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(a|an|the|el|la|los|las|un|una|unos|unas) /, '');
}

/** The book survived: its last page is a guess that matches the word. Empty books never do. */
/** Intact by the rule, or by the VIP's veto (the owner, 2026-09-21: "Adolf Hitler" → "Adolf"). */
export function bookIntact(state: { books: Book[]; vetoed?: number[] }, b: number): boolean {
  const book = state.books[b];
  return book !== undefined && (isIntact(book) || (state.vetoed ?? []).includes(b));
}

export function isIntact(book: Book): boolean {
  if (book.pages.length < 2) return false;
  const first = book.pages[0];
  const last = book.pages[book.pages.length - 1];
  if (!first || first.kind !== 'word' || !last || last.kind !== 'guess' || last.text === null)
    return false;
  return normalizeText(last.text) === normalizeText(first.text);
}

export function wordOf(book: Book): string {
  const first = book.pages[0];
  return first && first.kind === 'word' ? first.text : '—';
}

export function lastGuessOf(book: Book): string {
  const last = book.pages[book.pages.length - 1];
  if (!last || last.kind !== 'guess') return '—';
  return last.text ?? '???';
}
