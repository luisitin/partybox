// The step machinery shared by phases/draw.ts, phases/pass.ts and phases/guess.ts: each player owes
// one or two pages of the book in their hands; the step closes when every connected player is done
// or the deadline passes, filling what is missing with placeholders ("???", or the artist's draft
// — the sheet as it stood — else an empty sheet) authored by whoever owed them.
import { allConnectedDone, enterPhase, hasPlayer } from '@partybox/game-sdk';
import { authorOfPage, bookInHands, kindOfPage, owedNow, pagesOfStep, targetLength } from './books';
import type { Book, Drawing, Input, Page, State, Transition } from './types';

/** Phase id for a step: 1 = draw your word; the last = guess only; in between = guess then draw. */
export function phaseOfStep(state: State, step: number): 'draw' | 'pass' | 'guess' {
  if (step === 1) return 'draw';
  return step >= state.passes + 1 ? 'guess' : 'pass';
}

/** Enters the phase for `state.step` with a deadline sized to what the step asks for. */
export function enterStep(state: State, now: number): State {
  const phase = phaseOfStep(state, state.step);
  const seconds =
    phase === 'draw'
      ? state.settings.drawSeconds
      : phase === 'guess'
        ? state.settings.guessSeconds
        : state.settings.guessSeconds + state.settings.drawSeconds;
  return enterPhase(state, phase, now, seconds * 1000);
}

/** Appends `page` to the book in `playerId`'s hands if it is exactly the page they owe now. */
export function submitPage(state: State, playerId: string, page: Page): State | null {
  if (!hasPlayer(state, playerId)) return null;
  const b = bookInHands(state, playerId);
  if (b < 0) return null;
  const owed = owedNow(state, playerId);
  if (owed === null || owed !== page.kind) return null;
  const books = state.books.map((bk, i): Book =>
    i === b ? { ...bk, pages: [...bk.pages, page] } : bk,
  );
  return { ...state, books };
}

/** Ids that have finished this step (the "all done" denominator is connected players). */
export function submittedIds(state: State): string[] {
  const target = targetLength(state);
  return state.books
    .filter((book) => book.pages.length >= target)
    .map((book) => book.pages[target - 1]?.authorId ?? '')
    .filter((id) => id !== '');
}

/** The sheet `playerId` has drawn so far this step (a `draft`), if any. */
function draftOf(state: State, playerId: string): Drawing | null {
  const drafts = state.drafts;
  return drafts && Object.hasOwn(drafts, playerId) ? (drafts[playerId] ?? null) : null;
}

/**
 * Fills every missing page of this step with its placeholder — a drawing takes the artist's draft
 * where there is one — advances, drops the drafts, and hands over to `next`.
 */
export function closeStep(state: State, now: number, next: Transition): State {
  const books = state.books.map((book, b): Book => {
    const pages = [...book.pages];
    for (const i of pagesOfStep(state, state.step)) {
      if (pages.length > i) continue;
      const authorId = authorOfPage(state, b, i);
      // I-213: why this page is filled in — its author had dropped out, or the clock ran out
      const filled = state.players[authorId]?.connected === false ? 'away' : 'time';
      pages.push(
        kindOfPage(i) === 'draw'
          ? { kind: 'draw', authorId, drawing: draftOf(state, authorId), filled }
          : { kind: 'guess', authorId, text: null, filled },
      );
    }
    return pages.length === book.pages.length ? book : { ...book, pages };
  });
  const { drafts: _drafts, ...rest } = state;
  return next({ ...rest, books, step: state.step + 1 }, now);
}

/** Keeps the sheet so far for the deadline; only from a player who owes a drawing right now. */
function applyDraft(state: State, playerId: string, drawing: Drawing): State {
  if (!hasPlayer(state, playerId) || owedNow(state, playerId) !== 'draw') return state;
  return { ...state, drafts: { ...(state.drafts ?? {}), [playerId]: drawing } };
}

/** The player's draft is spent once a page of theirs is in (a drawing, or a guess in a pass). */
function withoutDraft(state: State, playerId: string): State {
  if (!state.drafts || !Object.hasOwn(state.drafts, playerId)) return state;
  const { [playerId]: _gone, ...drafts } = state.drafts;
  return { ...state, drafts };
}

/** The shared input handler: a guess or a drawing from a player, in the order the step asks. */
export function applyStepInput(
  state: State,
  playerId: string,
  input: Input,
  now: number,
  next: Transition,
): State {
  if (input.type === 'draft') return applyDraft(state, playerId, { strokes: input.strokes });
  let page: Page | null = null;
  if (input.type === 'draw')
    page = { kind: 'draw', authorId: playerId, drawing: { strokes: input.strokes } };
  else if (input.type === 'guess')
    page = { kind: 'guess', authorId: playerId, text: input.text.trim() };
  if (!page) return state;
  const submitted = submitPage(state, playerId, page);
  if (!submitted) return state;
  const after = withoutDraft(submitted, playerId);
  return allConnectedDone(after, submittedIds(after)) ? closeStep(after, now, next) : after;
}
