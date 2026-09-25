// I-540: the phone's reveal knows the race.
import { describe, expect, it } from 'vitest';
import { placeOf } from '../server/views';
import type { State } from '../server/types';

const state = (scores: Record<string, number>, lastDelta: Record<string, number> = {}): State =>
  ({
    players: Object.fromEntries(Object.keys(scores).map((id) => [id, { id, name: id.toUpperCase(), avatarId: 'fox', connected: true }])),
    scores,
    lastDelta,
  }) as unknown as State;

describe('I-540: my place', () => {
  it('behind the nearest rival, ahead of the next, tied when level', () => {
    const s = state({ a: 900, b: 794, c: 883, d: 700 });
    expect(placeOf(s, 'b')).toMatchObject({ rank: 3, count: 4, relation: 'behind', gap: 89, rival: 'C' });
    expect(placeOf(s, 'a')).toMatchObject({ rank: 1, relation: 'ahead', gap: 17, rival: 'C' });
    expect(placeOf(state({ a: 5, b: 5 }), 'a')).toMatchObject({ relation: 'tied', rival: 'B' });
  });
  it('B: the move this question made', () => {
    const s = state({ a: 900, b: 1000 }, { a: 0, b: 300 });
    expect(placeOf(s, 'b')?.moved).toBe(1);
    expect(placeOf(s, 'a')?.moved).toBe(-1);
    // the first question: everyone was level at 0 — no move
    expect(placeOf(state({ a: 0, b: 500 }, { a: 0, b: 500 }), 'a')?.moved).toBe(0);
  });
});
