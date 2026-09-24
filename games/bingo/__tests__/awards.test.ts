// I-401: Bingo's awards — and the owner's note: only an earned award shows; a tie or nothing that
// triggers it gives none.
import { describe, expect, it } from 'vitest';
import { awards } from '../server/scoring';
import type { State } from '../server/types';

type Row = State['history'][number];
const state = (history: Row[], wrongClaims?: Record<string, number>): State =>
  ({ players: { a: {}, b: {}, c: {} }, history, wrongClaims }) as unknown as State;
const ids = (s: State): string[] => awards(s).map((a) => a.id);
const win = (winnerId: string | null, calls: number, clean?: boolean): Row => ({
  round: 1,
  winnerId,
  calls,
  ...(clean === undefined ? {} : { clean }),
});

describe('I-401: Quick draw', () => {
  it('earned: the one player with the fewest calls to a bingo', () => {
    const a = awards(state([win('a', 30, false), win('b', 18, false), win(null, 75)]));
    expect(a).toContainEqual(
      expect.objectContaining({ id: 'quick-draw', playerId: 'b', description: 'Bingo on call 18' }),
    );
  });
  it('a tie for fewest gives none', () => {
    expect(ids(state([win('a', 18, false), win('b', 18, false)]))).not.toContain('quick-draw');
  });
  it('one player holding the fewest twice is not a tie', () => {
    const a = awards(state([win('a', 18, false), win('a', 18, false), win('b', 30, false)]));
    expect(a).toContainEqual(expect.objectContaining({ id: 'quick-draw', playerId: 'a' }));
  });
  it('no bingo, no award', () => {
    expect(ids(state([win(null, 75)]))).toEqual([]);
  });
});

describe('I-401: Clean card', () => {
  it('earned: the one player with the most clean wins', () => {
    const a = awards(state([win('a', 30, true), win('a', 40, true), win('b', 18, true)]));
    expect(a).toContainEqual(
      expect.objectContaining({
        id: 'clean-card',
        playerId: 'a',
        description: '2 wins with no stray daubs',
      }),
    );
  });
  it('a tie gives none', () => {
    expect(ids(state([win('a', 30, true), win('b', 18, true)]))).not.toContain('clean-card');
  });
  it('no clean win, no award', () => {
    expect(ids(state([win('a', 30, false), win('b', 18, false)]))).not.toContain('clean-card');
  });
});

describe('I-401 B: Trigger finger', () => {
  it('earned: the one player with the most wrong claims', () => {
    const a = awards(state([], { a: 2, b: 1 }));
    expect(a).toContainEqual(
      expect.objectContaining({
        id: 'trigger-finger',
        playerId: 'a',
        description: '2 wrong BINGO!s',
      }),
    );
  });
  it('a tie gives none', () => {
    expect(ids(state([], { a: 1, b: 1 }))).not.toContain('trigger-finger');
  });
  it('no wrong claim, no award', () => {
    expect(ids(state([], {}))).toEqual([]);
    expect(ids(state([]))).toEqual([]);
  });
});
