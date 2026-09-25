// I-496: the rule's text is where heads are up, and "nothing" never matches "nothing".
import { describe, expect, it } from 'vitest';
import { isIntact } from '../server/books';
import type { Book } from '../server/types';

const book = (word: string, guess: string): Book =>
  ({
    ownerId: 'a',
    pages: [
      { kind: 'word', text: word, authorId: 'a' },
      { kind: 'draw', drawing: null, authorId: 'b' },
      { kind: 'guess', text: guess, authorId: 'c' },
    ],
  }) as unknown as Book;

describe('I-496: an unreadable word never survives by accident', () => {
  it('emoji or Cyrillic against "???" is not intact; a real match still is', () => {
    expect(isIntact(book('🍕', '???'))).toBe(false);
    expect(isIntact(book('Привет', '🤷'))).toBe(false);
    expect(isIntact(book('a volcano', 'Volcano'))).toBe(true);
  });
});

describe('I-496 B: the room stamps WRITING', () => {
  it('two different callers stamp a drawing; its author cannot call it', async () => {
    const { reduceShow, stampedPage } = await import('../server/phases/show');
    const s0 = {
      phase: { id: 'show', startedAt: 0, deadline: 9_000 },
      players: { a: { id: 'a', name: 'A' }, b: { id: 'b', name: 'B' }, c: { id: 'c', name: 'C' } },
      books: [book('cat', 'cat')],
      showing: { book: 0, page: 1, verdict: null, line: null },
      intactBooks: 0,
    } as never;
    const call = (s: never, who: string) =>
      reduceShow(s, { type: 'input', now: 1, playerId: who, input: { type: 'writing' } } as never, (x) => x) as never;
    let s = call(s0, 'b'); // the author: ignored
    expect(stampedPage(s, 0, 1)).toBe(false);
    s = call(call(s, 'a'), 'a'); // once each
    expect(stampedPage(s, 0, 1)).toBe(false);
    s = call(s, 'c');
    expect(stampedPage(s, 0, 1)).toBe(true);
  });
});
