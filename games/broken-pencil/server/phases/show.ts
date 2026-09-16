// Phase "show": the TV turns the pages of every book, first to last, one page at a time. No
// inputs exist here — the VIP's skip is "Next ▸", pause is "hold this page"; without either a
// page auto-turns after SHOW_MS for its kind. The verdict is computed when a last page comes up.
import { enterPhase, isTimerFor, pick } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { isIntact } from '../books';
import { LINES } from '../content';
import { SHOW_MS, SUMMARY_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function showPage(state: State, b: number, page: number, now: number): State {
  const book = state.books[b];
  const current = book?.pages[page];
  const kind = current?.kind ?? 'word';
  let verdict: 'intact' | 'broken' | null = null;
  let line: string | null = null;
  let rng = state.rng;
  let intactBooks = state.intactBooks;
  if (book && page === book.pages.length - 1) {
    const intact = isIntact(book);
    verdict = intact ? 'intact' : 'broken';
    if (intact) intactBooks++;
    [line, rng] = pick(rng, intact ? LINES.intact : LINES.broken);
  }
  return enterPhase(
    { ...state, rng, intactBooks, showing: { book: b, page, verdict, line } },
    'show',
    now,
    SHOW_MS[kind],
  );
}

/** The first page of the first book (what closing the last step leads to). */
export function enterShow(state: State, now: number): State {
  return showPage(state, 0, 0, now);
}

/** Next page; next book after a last page; `next` (the summary) after the last book. */
export function turnPage(state: State, now: number, next: Transition): State {
  const showing = state.showing;
  if (!showing) return next(state, now);
  const book = state.books[showing.book];
  if (book && showing.page + 1 < book.pages.length)
    return showPage(state, showing.book, showing.page + 1, now);
  if (showing.book + 1 < state.books.length) return showPage(state, showing.book + 1, 0, now);
  return next(state, now);
}

export function reduceShow(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return turnPage(state, event.now, next);
  return state;
}

/** Phase "summary": every book's word → last guess, then `done` (the engine's results screen). */
export function enterSummary(state: State, now: number): State {
  return enterPhase(state, 'summary', now, SUMMARY_MS);
}

export function reduceSummary(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}
