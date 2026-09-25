// I-213: a page the step closed on remembers why.
import { describe, expect, it } from 'vitest';
import { closeStep } from '../server/step';
import type { State } from '../server/types';

describe('I-213: the room moved on — and knows why', () => {
  it('an away author\'s page is marked away; a connected one\'s is marked time', () => {
    const s = {
      phase: { id: 'draw', startedAt: 0, deadline: 1 },
      players: { a: { id: 'a', name: 'A', connected: false }, b: { id: 'b', name: 'B', connected: true } },
      seats: ['a', 'b'],
      books: [
        { ownerId: 'a', pages: [{ kind: 'word', text: 'cat', authorId: 'a' }] },
        { ownerId: 'b', pages: [{ kind: 'word', text: 'sun', authorId: 'b' }] },
      ],
      step: 1,
      passes: 1,
      drafts: { a: { strokes: [[0, 0, 1, 1]] } },
    } as unknown as State;
    const out = closeStep(s, 1, (x) => x);
    const pageOf = (who: string) => out.books.flatMap((bk) => bk.pages).find((p) => p.authorId === who && p.kind === 'draw');
    expect(pageOf('a')).toMatchObject({ filled: 'away' });
    expect(pageOf('b')).toMatchObject({ filled: 'time' });
  });
});
