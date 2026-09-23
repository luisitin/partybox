// I-401: Bingo's awards.
import { describe, expect, it } from 'vitest';
import { awards } from '../server/scoring';
import type { State } from '../server/types';

const state = (extra: Partial<State>): State =>
  ({
    players: { a: {}, b: {} },
    history: [
      { round: 1, winnerId: 'a', calls: 30, clean: false },
      { round: 2, winnerId: 'b', calls: 18, clean: true },
      { round: 3, winnerId: null, calls: 75 },
    ],
    ...extra,
  }) as unknown as State;

describe('I-401: Bingo awards', () => {
  it('the fastest bingo and a clean win', () => {
    const a = awards(state({}));
    expect(a).toContainEqual(expect.objectContaining({ id: 'quick-draw', playerId: 'b', description: 'Bingo on call 18' }));
    expect(a).toContainEqual(expect.objectContaining({ id: 'clean-card', playerId: 'b' }));
  });
  it('no bingo, no awards', () => {
    expect(awards(state({ history: [] }))).toEqual([]);
  });
  it('the most wrong claims', () => {
    const a = awards(state({ wrongClaims: { a: 2, b: 1 } } as Partial<State>));
    expect(a).toContainEqual(expect.objectContaining({ id: 'trigger-finger', playerId: 'a', description: '2 wrong BINGO!s' }));
  });
});
