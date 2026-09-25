// I-202 B: a laugh per player per page, never at your own page.
import { describe, expect, it } from 'vitest';
import { reduceShow } from '../server/phases/show';
import type { State } from '../server/types';

const s0 = {
  phase: { id: 'show', startedAt: 0, deadline: 9_000 },
  players: { a: { id: 'a', name: 'A' }, b: { id: 'b', name: 'B' }, c: { id: 'c', name: 'C' } },
  books: [{ ownerId: 'a', pages: [{ kind: 'word', text: 'cat', authorId: 'a' }, { kind: 'draw', drawing: null, authorId: 'b' }] }],
  showing: { book: 0, page: 1, verdict: null, line: null },
  intactBooks: 0,
} as unknown as State;

const laugh = (s: State, who: string) =>
  reduceShow(s, { type: 'input', now: 1, playerId: who, input: { type: 'laugh' } }, (x) => x);

describe('I-202 B: laughs', () => {
  it('counts once per player, never the author', () => {
    let s = laugh(s0, 'b'); // b drew it
    expect(s.laughs?.['0:1'] ?? []).toEqual([]);
    s = laugh(laugh(laugh(s, 'a'), 'a'), 'c');
    expect(s.laughs?.['0:1']).toEqual(['a', 'c']);
  });
});
