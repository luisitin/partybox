// The draw/guess step machinery shared by phases/draw.ts and phases/guess.ts: one page per player
// per step; the step closes when every connected player has submitted or the deadline passes,
// filling the missing pages with placeholders (empty canvas / "???") authored by whoever owed them.
import { allConnectedDone, enterPhase, hasPlayer } from '@partybox/game-sdk';
import { authorOfPage, bookInHands, kindOfPage } from './books';
import type { Book, Input, Page, State, Transition } from './types';

/** Enters the phase for the current step (odd steps draw, even steps guess). */
export function enterStep(state: State, now: number): State {
  const kind = kindOfPage(state.step);
  const seconds = kind === 'draw' ? state.settings.drawSeconds : state.settings.guessSeconds;
  return enterPhase(state, kind === 'draw' ? 'draw' : 'guess', now, seconds * 1000);
}

/** Appends `page` to the book in `playerId`'s hands if they have not written this step yet. */
export function submitPage(state: State, playerId: string, page: Page): State | null {
  if (!hasPlayer(state, playerId)) return null;
  const b = bookInHands(state, playerId);
  if (b < 0) return null;
  const book = state.books[b];
  if (!book || book.pages.length !== state.step) return null;
  const books = state.books.map((bk, i): Book =>
    i === b ? { ...bk, pages: [...bk.pages, page] } : bk,
  );
  return { ...state, books };
}

/** Ids that have written this step's page (the "all submitted" denominator is connected players). */
export function submittedIds(state: State): string[] {
  return state.books
    .filter((book) => book.pages.length > state.step)
    .map((book) => book.pages[state.step]?.authorId ?? '')
    .filter((id) => id !== '');
}

/** Fills every missing page with its placeholder, advances the step, and hands over to `next`. */
export function closeStep(state: State, now: number, next: Transition): State {
  const books = state.books.map((book, b): Book => {
    if (book.pages.length > state.step) return book;
    const authorId = authorOfPage(state, b, state.step);
    const page: Page =
      kindOfPage(state.step) === 'draw'
        ? { kind: 'draw', authorId, drawing: null }
        : { kind: 'guess', authorId, text: null };
    return { ...book, pages: [...book.pages, page] };
  });
  return next({ ...state, books, step: state.step + 1 }, now);
}

/** The shared input handler: a page of the right kind from a player, once per step. */
export function applyStepInput(
  state: State,
  playerId: string,
  input: Input,
  now: number,
  next: Transition,
): State {
  let page: Page | null = null;
  if (input.type === 'draw' && state.phase.id === 'draw')
    page = { kind: 'draw', authorId: playerId, drawing: { strokes: input.strokes } };
  else if (input.type === 'guess' && state.phase.id === 'guess')
    page = { kind: 'guess', authorId: playerId, text: input.text.trim() };
  if (!page) return state;
  const after = submitPage(state, playerId, page);
  if (!after) return state;
  return allConnectedDone(after, submittedIds(after)) ? closeStep(after, now, next) : after;
}
