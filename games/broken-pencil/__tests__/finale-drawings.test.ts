// I-218 B: the summary carries each book's first drawing.
import { describe, expect, it } from 'vitest';
import { summary } from '../server/scoring';
import type { State } from '../server/types';

describe('I-218 B: the pictures reach the ending', () => {
  it("a book's first drawing is in its summary; a book with none has null", () => {
    const drawing = { w: 1, h: 1, strokes: [] };
    const s = {
      players: { a: { id: 'a', name: 'A' }, b: { id: 'b', name: 'B' } },
      books: [
        { ownerId: 'a', pages: [{ kind: 'word', text: 'cat', authorId: 'a' }, { kind: 'draw', drawing, authorId: 'b' }, { kind: 'guess', text: 'cat', authorId: 'a' }] },
        { ownerId: 'b', pages: [{ kind: 'word', text: 'sun', authorId: 'b' }] },
      ],
    } as unknown as State;
    const rows = summary(s);
    expect(rows[0]?.drawing).toBe(drawing);
    expect(rows[1]?.drawing).toBeNull();
  });
});
