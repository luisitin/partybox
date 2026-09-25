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
