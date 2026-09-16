// Routing and book helpers shared by the phase files (which never import each other).
//
// Page index i ≥ 1 of the book owned by seat b is written by seat (b + i − ownerDraws) mod N, so
// at step i seat k holds book (k − i + ownerDraws) mod N. Every player works exactly one page per
// step and never the same book twice (P ≤ N − 1). With ownerDraws = 1, step 1 is your own book.
import type { Book, Page, State } from './types';

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Index of the book in `playerId`'s hands this step, or −1 for spectators. */
export function bookInHands(state: State, playerId: string): number {
  const N = state.seats.length;
  const k = state.seats.indexOf(playerId);
  if (k < 0 || N === 0) return -1;
  return mod(k - state.step + state.ownerDraws, N);
}

/** Who owes page `i` (≥ 1) of book `b`. */
export function authorOfPage(state: State, b: number, i: number): string {
  const N = state.seats.length;
  return state.seats[mod(b + i - state.ownerDraws, N)] as string;
}

/** Who gets book `b` after page `i` is written (null after the last page). */
export function nextAuthor(state: State, b: number, i: number): string | null {
  return i + 1 < state.pageCount ? authorOfPage(state, b, i + 1) : null;
}

/** Page kind for index i: 0 = word, odd = drawing, even = guess. */
export function kindOfPage(i: number): Page['kind'] {
  return i === 0 ? 'word' : i % 2 === 1 ? 'draw' : 'guess';
}

/** Has `playerId` written this step's page of the book in their hands? */
export function submittedThisStep(state: State, playerId: string): boolean {
  const b = bookInHands(state, playerId);
  if (b < 0) return false;
  return (state.books[b]?.pages.length ?? 0) > state.step;
}

/** Lower-case, punctuation and extra spaces out, a leading a/an/the dropped. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(a|an|the) /, '');
}

/** The book survived: its last page is a guess that matches the word. Empty books never do. */
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
