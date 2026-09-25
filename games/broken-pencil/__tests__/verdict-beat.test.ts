// I-512 B: a last page can't be turned before the verdict's beat (3.5 s for an UNBROKEN book, the
// TV's longer beat for it); every other page turns at once.
import { describe, expect, it } from 'vitest';
import { reduceShow } from '../server/phases/show';
import { VERDICT_BEAT_INTACT_MS, VERDICT_BEAT_MS } from '../server/types';
import type { State } from '../server/types';

const lastPage = {
  phase: { id: 'show', startedAt: 1000, deadline: 99_000 },
  players: { a: { id: 'a', name: 'A' } },
  books: [
    {
      ownerId: 'a',
      pages: [
        { kind: 'word', text: 'cat' },
        { kind: 'draw', drawing: null },
        { kind: 'guess', text: 'dog' },
      ],
    },
  ],
  showing: { book: 0, page: 2, verdict: 'broken', line: 'x' },
  intactBooks: 0,
} as unknown as State;

const turn = (state: State, now: number): State =>
  reduceShow(state, { type: 'input', now, playerId: 'a', input: { type: 'turn' } }, (s) => ({
    ...s,
    showing: null,
  }));

describe('I-512 B: the verdict gets its beat', () => {
  it('a turn inside the beat is ignored; after it, the show moves on', () => {
    expect(turn(lastPage, 1000 + VERDICT_BEAT_MS - 1)).toBe(lastPage);
    expect(turn(lastPage, 1000 + VERDICT_BEAT_MS).showing).toBeNull();
  });

  it('an UNBROKEN book holds Next for its longer beat', () => {
    const intact = { ...lastPage, showing: { ...lastPage.showing!, verdict: 'intact' } } as State;
    expect(turn(intact, 1000 + VERDICT_BEAT_INTACT_MS - 1)).toBe(intact);
    expect(turn(intact, 1000 + VERDICT_BEAT_INTACT_MS).showing).toBeNull();
  });

  it('a page before the last turns at once', () => {
    const middle = {
      ...lastPage,
      rng: { seed: 1, step: 0 },
      showing: { book: 0, page: 1, verdict: null, line: null },
    } as State;
    expect(turn(middle, 1000 + 1_200).showing) // I-491 A: past the 1.2 s guard.toMatchObject({ book: 0, page: 2 });
  });
});
