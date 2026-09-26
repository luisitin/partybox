// I-490: a bot's book is shown the short way.
import { describe, expect, it } from 'vitest';
import { seedRng } from '@partybox/game-sdk';
import { reduceShow, turnPage } from '../server/phases/show';
import { inputSchema } from '../server/types';
import type { State } from '../server/types';

const state = (bot: boolean): State =>
  ({
    phase: { id: 'show', startedAt: 0, deadline: 9_000 },
    players: { b: { id: 'b', name: 'Bot 1', bot }, p: { id: 'p', name: 'P' } },
    books: [
      {
        ownerId: 'b',
        pages: [
          { kind: 'word', text: 'cat' },
          { kind: 'guess', text: 'dog' },
          { kind: 'guess', text: 'hog' },
          { kind: 'guess', text: 'log' },
        ],
      },
      {
        ownerId: 'p',
        pages: [
          { kind: 'word', text: 'sun' },
          { kind: 'guess', text: 'bun' },
        ],
      },
    ],
    showing: { book: 0, page: 0, verdict: null, line: null },
    intactBooks: 0,
    rng: seedRng(1),
  }) as unknown as State;

describe("I-490: a bot's book, the short way", () => {
  it("jumps from a bot's word to its last page; a person's book turns page by page", () => {
    const done = (s: State) => s;
    expect(turnPage(state(true), 1000, done).showing?.page).toBe(3);
    expect(turnPage(state(false), 1000, done).showing?.page).toBe(1);
  });
});

describe('I-490 B: the VIP next book', () => {
  const done = (s: State) => ({ ...s, phase: { id: 'summary', startedAt: 0 } }) as State;
  const skip = (st: State, playerId: string, vip: boolean, book: number) =>
    reduceShow(
      st,
      { type: 'input', now: 1000, playerId, vip, input: { type: 'nextBook', book } },
      done,
    );
  it('skips the book on stage for the VIP only, never while their own book is up', () => {
    expect(skip(state(true), 'p', true, 0).showing?.book).toBe(1);
    expect(skip(state(true), 'p', false, 0).showing?.book).toBe(0);
    const own = { ...state(true), showing: { book: 1, page: 0, verdict: null, line: null } };
    expect(skip(own as State, 'p', true, 1).showing?.book).toBe(1);
    expect(skip(own as State, 'p', true, 1).phase.id).toBe('show');
  });
  it('ignores a stale or repeated tap after the show moves to another book', () => {
    const base = state(true);
    const threeBooks = {
      ...base,
      players: { ...base.players, c: { id: 'c', name: 'C', avatarId: 'fox', connected: true } },
      books: [base.books[0]!, { ...base.books[1]!, ownerId: 'c' }, base.books[1]!],
    } as State;
    expect(inputSchema.safeParse({ type: 'nextBook' }).success).toBe(false);
    expect(skip(threeBooks, 'p', true, 1)).toBe(threeBooks);

    const second = skip(threeBooks, 'p', true, 0);
    expect(second.showing?.book).toBe(1);
    expect(skip(second, 'p', true, 0)).toBe(second);
    expect(skip(second, 'p', true, 2)).toBe(second);
    expect(skip(second, 'p', true, 1).showing?.book).toBe(2);
  });
});
