// Phase "show": each owner presents their book from their phone — `turn` from the presenter is
// the page control; the VIP's skip (the TV's Skip) turns too; a page auto-turns after SHOW_MS as a
// fallback so a dawdling presenter never stalls the room. The verdict is computed on a last page.
import { enterPhase, isTimerFor, pick } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { isIntact } from '../books';
import { LINES } from '../content';
import { BOT_SHOW_MS, SHOW_MS, SUMMARY_MS, VERDICT_BEAT_MS } from '../types';
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
  // A bot owns no thumb: its pages turn on the shorter presenter-pace timers instead.
  const botsBook = book !== undefined && state.players[book.ownerId]?.bot === true;
  return enterPhase(
    { ...state, rng, intactBooks, showing: { book: b, page, verdict, line } },
    'show',
    now,
    (botsBook ? BOT_SHOW_MS : SHOW_MS)[kind],
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

/** The player whose book is on the TV (they hold the Next button). */
export function presenterOf(state: State): string | null {
  const showing = state.showing;
  if (state.phase.id !== 'show' || !showing) return null;
  return state.books[showing.book]?.ownerId ?? null;
}

/** The VIP's "close enough" (the owner, 2026-09-21): a broken book is called intact — on its last
 *  page during the show (the verdict flips on stage) or in the summary. Once per book. */
export function veto(state: State, event: GameEvent<Input>): State {
  if (event.type !== 'input' || event.input.type !== 'veto' || !event.vip) return state;
  const b = event.input.book;
  const book = state.books[b];
  if (!book || (state.vetoed ?? []).includes(b) || isIntact(book)) return state;
  const showing = state.showing;
  const onStage =
    state.phase.id === 'show' && showing?.book === b && showing.page === book.pages.length - 1;
  if (!onStage && state.phase.id !== 'summary') return state;
  return {
    ...state,
    vetoed: [...(state.vetoed ?? []), b],
    intactBooks: state.intactBooks + 1,
    showing: onStage && showing ? { ...showing, verdict: 'intact', line: VETO_LINE } : showing,
  };
}
const VETO_LINE = 'Close enough — the VIP allows it.';

export function reduceShow(state: State, event: GameEvent<Input>, next: Transition): State {
  if (event.type === 'input') {
    if (event.input.type === 'turn' && event.playerId === presenterOf(state)) {
      // I-512 B: the last page's verdict gets its beat before the presenter can move on
      if (state.showing?.verdict && event.now - state.phase.startedAt < VERDICT_BEAT_MS) return state;
      return turnPage(state, event.now, next);
    }
    return veto(state, event);
  }
  if (isTimerFor(state, event)) return turnPage(state, event.now, next);
  return state;
}

/** Phase "summary": every book's word → last guess, then `done` (the engine's results screen). */
export function enterSummary(state: State, now: number): State {
  return enterPhase(state, 'summary', now, SUMMARY_MS);
}

export function reduceSummary(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return veto(state, event);
}

export function enterDone(state: State, now: number): State {
  return enterPhase(state, 'done', now, null);
}
