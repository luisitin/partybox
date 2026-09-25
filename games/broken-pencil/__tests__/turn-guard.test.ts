// I-491: a pocket's double tap turns one page.
import { describe, expect, it } from 'vitest';
import { reduceShow } from '../server/phases/show';
import { MIN_PAGE_MS } from '../server/types';
import { seedRng } from '@partybox/game-sdk';
import type { State } from '../server/types';

const state = (): State =>
  ({
    phase: { id: 'show', startedAt: 1000, deadline: 99_000 },
    rng: seedRng(1),
    players: { a: { id: 'a', name: 'A' } },
    books: [{ ownerId: 'a', pages: [{ kind: 'word', text: 'cat' }, { kind: 'guess', text: 'dog' }, { kind: 'guess', text: 'hog' }] }],
    showing: { book: 0, page: 0, verdict: null, line: null },
    intactBooks: 0,
  }) as unknown as State;

const turn = (s: State, now: number): State =>
  reduceShow(s, { type: 'input', now, playerId: 'a', input: { type: 'turn' } }, (x) => x);

describe('I-491: the presenter turns on purpose', () => {
  it('a turn in the first moment is ignored; after it, the page turns', () => {
    const s = state();
    expect(turn(s, 1000 + MIN_PAGE_MS - 1).showing?.page).toBe(0);
    expect(turn(s, 1000 + MIN_PAGE_MS).showing?.page).toBe(1);
  });
});
