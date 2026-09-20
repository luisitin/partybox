// Views for Broken Pencil. The rule is "never spoil": while playing, a phone sees only the page it
// must work from (the last drawing of the book in its hands, or its own guess to draw) and what it
// wrote itself; the TV sees only progress. During the show the TV carries the pages shown so far
// and nothing beyond the current one; the presenter's phone carries the page controls.
import { controllerEnvelope, envelope, hasPlayer } from '@partybox/game-sdk';
import type { ControllerView, PlayerStatus, TvView } from '@partybox/game-sdk';
import { bookInHands, owedNow, pagesOfStep, submittedThisStep } from './books';
import { hasPicked } from './phases/pick';
import { presenterOf } from './phases/show';
import { summary } from './scoring';
import type { BookSummary } from './scoring';
import { EVERYONE } from './types';
import type { Drawing, Page, State } from './types';

export type PageView = Page & { authorName: string };

interface Common {
  /** 1..P+1 while playing; 0 during pick. */
  step: number;
  /** P + 1: draw, then the passes, then the last guess. */
  stepCount: number;
  pageCount: number;
  bookCount: number;
  passes: number;
  /** True when every other player touches every book (the default). */
  fullCircle: boolean;
  intactBooks: number;
}

export interface PencilTvView extends TvView, Common {
  /** pick / draw / pass / guess: where everyone is. */
  progress: { playerId: string; stage: 'guess' | 'draw' | 'done' }[];
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
  /** summary / done. */
  summary: BookSummary[] | null;
}

export type Prompt =
  { kind: 'text'; text: string } | { kind: 'drawing'; drawing: Drawing | null } | null;

export interface PencilControllerView extends ControllerView, Common {
  /** pick: my three words. */
  offers: string[] | null;
  customWords: boolean;
  /** I-023 C: the room plays spicy — the hard tier draws from the spicy pack. */
  spicy: boolean;
  /** What I owe right now: a guess of `prompt`, a drawing of `prompt`, or nothing (sent / watching). */
  stage: 'guess' | 'draw' | null;
  /** The one page I work from — and nothing else. */
  prompt: Prompt;
  /** Whose book is in my hands. */
  bookOwnerName: string | null;
  submitted: boolean;
  /** What I handed in this step (so the phone can show it after sending). */
  mine: { text?: string; drawing?: Drawing } | null;
  /** My sheet so far this step (`draft`), so a phone that reloads mid-drawing gets it back. */
  draft: Drawing | null;
  /** Who gets this book next (null after the last page). */
  nextName: string | null;
  showing: null | {
    book: number;
    ownerName: string;
    page: number;
    pageKind: Page['kind'];
    /** I hold the Next button. */
    presenting: boolean;
    /** True on the last page of the book / the last book. */
    lastPage: boolean;
    lastBook: boolean;
  };
  summary: BookSummary[] | null;
  myBook: BookSummary | null;
}

function nameOf(state: State, id: string): string {
  return state.players[id]?.name ?? '?';
}

function playing(state: State): boolean {
  return state.phase.id === 'draw' || state.phase.id === 'pass' || state.phase.id === 'guess';
}

/** The closing screens, where every book is public. */
function closing(state: State): boolean {
  return state.phase.id === 'summary' || state.phase.id === 'done';
}

function stageOf(state: State, id: string): 'guess' | 'draw' | 'done' {
  if (state.phase.id === 'pick') return hasPicked(state, id) ? 'done' : 'guess';
  if (!playing(state)) return 'done';
  return owedNow(state, id) ?? 'done';
}

function statusOf(state: State): (id: string) => PlayerStatus {
  return (id) => {
    if (!state.seats.includes(id)) return 'spectator';
    if (state.phase.id === 'pick' || playing(state))
      return stageOf(state, id) === 'done' ? 'submitted' : 'active';
    if (state.phase.id === 'show') return presenterOf(state) === id ? 'active' : 'waiting';
    return 'waiting';
  };
}

function common(state: State): Common {
  return {
    step: state.step,
    stepCount: state.passes + 1,
    pageCount: state.pageCount,
    bookCount: state.books.length,
    passes: state.passes,
    fullCircle: state.settings.passes >= EVERYONE || state.passes >= state.seats.length - 1,
    intactBooks: closing(state) ? summary(state).filter((b) => b.intact).length : state.intactBooks,
  };
}

function quiet(state: State): 'quiet' | 'normal' {
  return state.phase.id === 'show' || state.phase.id === 'summary' ? 'quiet' : 'normal';
}

export function tvView(state: State, gameId: string): PencilTvView {
  const showing = state.showing;
  const book = showing ? state.books[showing.book] : undefined;
  return {
    ...envelope(state, gameId, { statusOf: statusOf(state) }),
    timerMode: quiet(state),
    ...common(state),
    progress: state.seats.map((playerId) => ({ playerId, stage: stageOf(state, playerId) })),
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

/** What I handed in this step, from the pages I authored among this step's pages. */
function mineOf(
  state: State,
  playerId: string,
  book: State['books'][number],
): PencilControllerView['mine'] {
  const out: { text?: string; drawing?: Drawing } = {};
  for (const i of pagesOfStep(state, state.step)) {
    const page = book.pages[i];
    if (!page || page.authorId !== playerId) continue;
    if (page.kind === 'guess') out.text = page.text ?? '???';
    if (page.kind === 'draw') out.drawing = page.drawing ?? { strokes: [] };
  }
  return Object.keys(out).length > 0 ? out : null;
}

export function controllerView(
  state: State,
  gameId: string,
  playerId: string,
): PencilControllerView {
  const seated = hasPlayer(state, playerId) && state.seats.includes(playerId);
  const b = seated && playing(state) ? bookInHands(state, playerId) : -1;
  const book = b >= 0 ? state.books[b] : undefined;
  const stage = b >= 0 ? owedNow(state, playerId) : null;
  const firstOfStep = pagesOfStep(state, state.step)[0] ?? 0;
  // What I work from: the page before this step's first page (the word I picked, or the drawing
  // that reached me); when I owe a drawing of my own guess, that guess.
  let prompt: Prompt = null;
  if (book && stage === 'guess') {
    const previous = book.pages[firstOfStep - 1];
    if (previous?.kind === 'draw') prompt = { kind: 'drawing', drawing: previous.drawing };
    else if (previous) prompt = { kind: 'text', text: previous.text ?? '???' };
  } else if (book && stage === 'draw') {
    const source = book.pages[book.pages.length - 1];
    prompt = {
      kind: 'text',
      text: (source && source.kind !== 'draw' ? source.text : null) ?? '???',
    };
  }
  const nextSeat =
    b >= 0 && state.step <= state.passes
      ? state.seats[(b + state.step) % state.seats.length]
      : undefined;
  const showing = state.showing;
  const shownBook = showing ? state.books[showing.book] : undefined;
  const all = closing(state) ? summary(state) : null;
  return {
    ...controllerEnvelope(state, gameId, playerId, { statusOf: statusOf(state) }),
    timerMode: quiet(state),
    ...common(state),
    offers: seated && state.phase.id === 'pick' ? (state.offers[playerId] ?? null) : null,
    customWords: state.settings.customWords,
    spicy: state.settings.spicy,
    stage,
    prompt,
    bookOwnerName: book ? nameOf(state, book.ownerId) : null,
    submitted: seated
      ? state.phase.id === 'pick'
        ? hasPicked(state, playerId)
        : playing(state) && submittedThisStep(state, playerId)
      : false,
    mine: book ? mineOf(state, playerId, book) : null,
    draft:
      stage === 'draw' && state.drafts && Object.hasOwn(state.drafts, playerId)
        ? (state.drafts[playerId] ?? null)
        : null,
    nextName: nextSeat ? nameOf(state, nextSeat) : null,
    showing:
      state.phase.id === 'show' && showing && shownBook
        ? {
            book: showing.book,
            ownerName: nameOf(state, shownBook.ownerId),
            page: showing.page,
            pageKind: shownBook.pages[showing.page]?.kind ?? 'word',
            presenting: shownBook.ownerId === playerId,
            lastPage: showing.page >= shownBook.pages.length - 1,
            lastBook: showing.book >= state.books.length - 1,
          }
        : null,
    summary: all,
    myBook: all?.find((s) => s.ownerId === playerId) ?? null,
  };
}
