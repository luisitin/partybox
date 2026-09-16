// No scoring by design: the show is the game. Everyone scores 0 and shares rank 1; each book that
// survived the circle earns its owner an honorary "Unbroken" award.
import { buildResults } from '@partybox/game-sdk';
import type { GameAward, GameResults } from '@partybox/game-sdk';
import { isIntact, lastGuessOf, wordOf } from './books';
import type { State } from './types';

export interface BookSummary {
  ownerId: string;
  ownerName: string;
  word: string;
  last: string;
  intact: boolean;
}

/** Every book's first word beside its last guess (done screen; VIP end may leave books short). */
export function summary(state: State): BookSummary[] {
  return state.books.map((book) => ({
    ownerId: book.ownerId,
    ownerName: state.players[book.ownerId]?.name ?? '?',
    word: wordOf(book),
    last: lastGuessOf(book),
    intact: isIntact(book),
  }));
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  const zero: Record<string, number> = {};
  for (const id of Object.keys(state.players)) zero[id] = 0;
  const awards: GameAward[] = state.books.filter(isIntact).map((book, i) => ({
    id: `unbroken-${i}`,
    title: 'Unbroken',
    description: `“${wordOf(book)}” survived ${state.seats.length} players`,
    playerId: book.ownerId,
  }));
  return buildResults(state, zero, awards);
}
