// I-512 B: a last page can't be turned before the verdict's beat.
import { describe, expect, it } from 'vitest';
import { reduceShow } from '../server/phases/show';
import { VERDICT_BEAT_MS } from '../server/types';
import type { State } from '../server/types';

const lastPage = {
  phase: { id: 'show', startedAt: 1000, deadline: 99_000 },
  players: { a: { id: 'a', name: 'A' } },
  books: [{ ownerId: 'a', pages: [{ kind: 'word', text: 'cat' }, { kind: 'draw', drawing: null }, { kind: 'guess', text: 'dog' }] }],
  showing: { book: 0, page: 2, verdict: 'broken', line: 'x' },
  intactBooks: 0,
} as unknown as State;

describe('I-512 B: the verdict gets its beat', () => {
  it('a turn inside the beat is ignored; after it, the show moves on', () => {
    const turn = (now: number) =>
      reduceShow(lastPage, { type: 'input', now, playerId: 'a', input: { type: 'turn' } }, () => ({ ...lastPage, showing: null }));
    expect(turn(1000 + VERDICT_BEAT_MS - 1)).toBe(lastPage);
    expect(turn(1000 + VERDICT_BEAT_MS).showing).toBeNull();
  });
});
