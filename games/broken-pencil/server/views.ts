// Views for Broken Pencil. The rule is "never spoil": while playing, a phone sees only the single
// previous page of the book in its hands (and what it wrote itself); the TV sees only progress.
// During the show the TV carries the pages shown so far and nothing beyond the current one.
import { controllerEnvelope, envelope, hasPlayer } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { bookInHands, nextAuthor, submittedThisStep } from './books';
import { hasPicked } from './phases/pick';
import { summary } from './scoring';
import type { BookSummary } from './scoring';
import { EVERYONE } from './types';
import type { Drawing, Page, State } from './types';

export type PageView = Page & { authorName: string };

interface Common {
  /** 1..L−1 while playing; 0 during pick. */
  step: number;
  pageCount: number;
  bookCount: number;
  passes: number;
  /** True when every other player touches every book (the default). */
  fullCircle: boolean;
  intactBooks: number;
}

export interface PencilTvView extends TvView, Common {
  /** pick / draw / guess: who has handed in this step. */
  progress: { playerId: string; done: boolean }[];
  showing: null | {
    book: number;
    ownerId: string;
    ownerName: string;
    page: number;
    /** pages[0..page] ONLY — never the unshown ones. */
    pages: PageView[];
    verdict: 'intact' | 'broken' | null;
    verdictLine: string | null;
  };
  /** done only. */
  summary: BookSummary[] | null;
}

export type Prompt =
  { kind: 'text'; text: string } | { kind: 'drawing'; drawing: Drawing | null } | null;

export interface PencilControllerView extends ControllerView, Common {
  /** pick: my three words. */
  offers: string[] | null;
  customWords: boolean;
  /** draw / guess: the previous page of the book in my hands — and nothing else. */
  prompt: Prompt;
  /** Whose book is in my hands. */
  bookOwnerName: string | null;
  submitted: boolean;
  /** What I handed in this step (so the phone can show it after sending). */
  mine: { drawing?: Drawing; text?: string } | null;
  /** Who gets this book next (null after the last page). */
  nextName: string | null;
  showing: null | {
    book: number;
    ownerName: string;
    page: number;
    pageKind: Page['kind'];
    /** Index of my page in the book on screen, when it is still to come. */
    myPageAt: number | null;
  };
  summary: BookSummary[] | null;
  myBook: BookSummary | null;
}

function nameOf(state: State, id: string): string {
  return state.players[id]?.name ?? '?';
}

function playing(state: State): boolean {
  return state.phase.id === 'draw' || state.phase.id === 'guess';
}

/** The closing screens, where every book is public. */
function closing(state: State): boolean {
  return state.phase.id === 'summary' || state.phase.id === 'done';
}

function doneThisPhase(state: State, id: string): boolean {
  if (state.phase.id === 'pick') return hasPicked(state, id);
  if (playing(state)) return submittedThisStep(state, id);
  return false;
}

function statusOf(state: State): (id: string) => PlayerStatus {
  return (id) => {
    if (!state.seats.includes(id)) return 'spectator';
    if (state.phase.id === 'pick' || playing(state))
      return doneThisPhase(state, id) ? 'submitted' : 'active';
    return 'waiting';
  };
}

function common(state: State): Common {
  return {
    step: state.step,
    pageCount: state.pageCount,
    bookCount: state.books.length,
    passes: state.passes,
    fullCircle: state.settings.passes >= EVERYONE || state.passes >= state.seats.length - 1,
    intactBooks: closing(state) ? summary(state).filter((b) => b.intact).length : state.intactBooks,
  };
}

export function tvView(state: State, gameId: string): PencilTvView {
  const showing = state.showing;
  const book = showing ? state.books[showing.book] : undefined;
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state) }),
    timerMode: state.phase.id === 'show' || state.phase.id === 'summary' ? 'quiet' : 'normal',
    ...common(state),
    progress: state.seats.map((playerId) => ({ playerId, done: doneThisPhase(state, playerId) })),
    showing:
      state.phase.id === 'show' && showing && book
        ? {
            book: showing.book,
            ownerId: book.ownerId,
            ownerName: nameOf(state, book.ownerId),
            page: showing.page,
            pages: book.pages
              .slice(0, showing.page + 1)
              .map((p) => ({ ...p, authorName: nameOf(state, p.authorId) })),
            verdict: showing.verdict,
            verdictLine: showing.line,
          }
        : null,
    summary: closing(state) ? summary(state) : null,
  };
}

export function controllerView(
  state: State,
  gameId: string,
  playerId: string,
): PencilControllerView {
  const seated = hasPlayer(state, playerId) && state.seats.includes(playerId);
  const b = seated && playing(state) ? bookInHands(state, playerId) : -1;
  const book = b >= 0 ? state.books[b] : undefined;
  const previous = book?.pages[state.step - 1];
  const minePage = book?.pages[state.step];
  let prompt: Prompt = null;
  if (previous?.kind === 'word' || previous?.kind === 'guess')
    prompt = { kind: 'text', text: previous.text ?? '???' };
  else if (previous?.kind === 'draw') prompt = { kind: 'drawing', drawing: previous.drawing };
  const showing = state.showing;
  const shownBook = showing ? state.books[showing.book] : undefined;
  const myPageIndex = shownBook ? shownBook.pages.findIndex((p) => p.authorId === playerId) : -1;
  const all = closing(state) ? summary(state) : null;
  return {
    ...controllerEnvelope(state, gameId, playerId, { statusOf: statusOf(state) }),
    timerMode: state.phase.id === 'show' || state.phase.id === 'summary' ? 'quiet' : 'normal',
    ...common(state),
    offers: seated && state.phase.id === 'pick' ? (state.offers[playerId] ?? null) : null,
    customWords: state.settings.customWords,
    prompt,
    bookOwnerName: book ? nameOf(state, book.ownerId) : null,
    submitted: seated ? doneThisPhase(state, playerId) : false,
    mine:
      minePage?.kind === 'draw'
        ? { drawing: minePage.drawing ?? { strokes: [] } }
        : minePage?.kind === 'guess'
          ? { text: minePage.text ?? '???' }
          : null,
    nextName:
      b >= 0
        ? (() => {
            const id = nextAuthor(state, b, state.step);
            return id ? nameOf(state, id) : null;
          })()
        : null,
    showing:
      state.phase.id === 'show' && showing && shownBook
        ? {
            book: showing.book,
            ownerName: nameOf(state, shownBook.ownerId),
            page: showing.page,
            pageKind: shownBook.pages[showing.page]?.kind ?? 'word',
            myPageAt: myPageIndex > showing.page ? myPageIndex : null,
          }
        : null,
    summary: all,
    myBook: all?.find((s) => s.ownerId === playerId) ?? null,
  };
}
