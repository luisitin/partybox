// Hints for the shared contract suite (packages/game-sdk/src/contract-tests). "Never spoil": while
// playing, no page text may reach the TV, and a phone may only carry the previous page of the book
// in its hands plus what it wrote itself. During the show the TV may show pages up to the current
// one and nothing beyond; phones carry no page text until `done`, when everything is public.
// The suite matches substrings, so a text that is ALSO legitimately visible (the same guess in two
// books, my own word picked by someone else) is excluded rather than reported.
import type { GameStateBase } from '@partybox/game-sdk';
import { bookInHands, pagesOfStep } from '../server/books';
import type { Page, State } from '../server/types';

function textOf(page: Page): string | null {
  return page.kind === 'word' ? page.text : page.kind === 'guess' ? page.text : null;
}

function split(state: State, visible: (b: number, i: number, page: Page) => boolean): string[] {
  const shown = new Set<string>();
  const hidden: string[] = [];
  state.books.forEach((book, b) =>
    book.pages.forEach((page, i) => {
      const text = textOf(page);
      if (!text) return;
      if (visible(b, i, page)) shown.add(text);
      else hidden.push(text);
    }),
  );
  // Substring semantics: "sun" inside a visible "sunburn" is not a leak the suite can tell apart.
  const visibleText = [...shown].join('|');
  // Short base64-alphabet words ("cat", "sun") also occur by chance inside stroke data, which
  // every draw view carries; __tests__/game.test.ts checks those structurally instead.
  return hidden.filter((t) => !visibleText.includes(t) && !/^[A-Za-z0-9+/]{1,5}$/.test(t));
}

export const contractConfig = {
  hiddenFromTv: (base: GameStateBase): string[] => {
    const state = base as State;
    if (state.phase.id === 'summary' || state.phase.id === 'done') return [];
    const showing = state.phase.id === 'show' ? state.showing : null;
    return split(
      state,
      (b, i) => showing !== null && (b < showing.book || (b === showing.book && i <= showing.page)),
    );
  },
  hiddenFromController: (base: GameStateBase, playerId: string): string[] => {
    const state = base as State;
    if (state.phase.id === 'summary' || state.phase.id === 'done') return [];
    const mine = new Set([...(state.offers[playerId] ?? []), playerId]);
    const playing =
      state.phase.id === 'draw' || state.phase.id === 'pass' || state.phase.id === 'guess';
    const inHands = playing ? bookInHands(state, playerId) : -1;
    const promptPage = (pagesOfStep(state, state.step)[0] ?? 0) - 1;
    return split(
      state,
      (b, i, page) =>
        page.authorId === playerId ||
        mine.has(textOf(page) ?? '') ||
        (b === inHands && i === promptPage),
    );
  },
  settingsVariants: [
    { passes: 2, drawSeconds: 30, guessSeconds: 15 },
    { passes: 1, customWords: false, spicy: true },
  ],
};
