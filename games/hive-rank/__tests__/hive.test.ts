// The hive's order and a round's points (README "Scoring"), as pure functions.
import { describe, expect, it } from 'vitest';
import {
  buildHive,
  isPermutation,
  lowsOf,
  pairKey,
  queensOf,
  samePairs,
  scoreOrder,
  scoreRound,
} from '../server/hive';

const PACK = ['a', 'b', 'c', 'd', 'e'];
const split = (s: string): string[] => s.split(' ');

describe('building the hive', () => {
  it('sums the spots and sorts lowest first', () => {
    const hive = buildHive(PACK, [split('e d c b a'), split('d e c b a')]);
    expect(hive?.totals).toEqual({ a: 10, b: 8, c: 6, d: 3, e: 3 });
    // d and e tie on 3: each has one first-place vote, one second — pack order puts d first.
    expect(hive?.order).toEqual(split('d e c b a'));
  });

  it('breaks a tie on total by first-place votes', () => {
    // a: 1 + 4 = 5 with a first place; b: 2 + 3 = 5 with none.
    const hive = buildHive(PACK, [split('a b c d e'), split('c d b a e')]);
    expect(hive?.totals['a']).toBe(5);
    expect(hive?.totals['b']).toBe(5);
    expect(hive?.order).toEqual(split('c a b d e'));
  });

  it('then by second-place votes', () => {
    // a: 2 + 4 = 6, b: 3 + 3 = 6; neither has a first place; a has a second place.
    const hive = buildHive(PACK, [split('c a b d e'), split('d c b a e')]);
    expect(hive?.totals['a']).toBe(6);
    expect(hive?.totals['b']).toBe(6);
    expect(hive?.order).toEqual(split('c d a b e'));
  });

  it('then by the pack order when every vote count ties', () => {
    // b and a trade places exactly: same total, same votes in every spot.
    const hive = buildHive(PACK, [split('b a c d e'), split('a b c d e')]);
    expect(hive?.order).toEqual(split('a b c d e'));
    const reversedPack = buildHive(split('b a c d e'), [split('b a c d e'), split('a b c d e')]);
    expect(reversedPack?.order).toEqual(split('b a c d e'));
  });

  it('needs at least two orders', () => {
    expect(buildHive(PACK, [])).toBeNull();
    expect(buildHive(PACK, [split('a b c d e')])).toBeNull();
    expect(buildHive(PACK, [split('a b c d e'), split('a b c d e')])).not.toBeNull();
  });
});

describe('scoring an order', () => {
  const hive = split('a b c d e');

  it('all five exact is 10 + the 2 bonus = 12', () => {
    expect(scoreOrder(hive, hive)).toEqual({ pts: 12, exact: 5, near: 0, perfect: true });
  });

  it('+2 exact, +1 one spot off, 0 further', () => {
    expect(scoreOrder(split('b a c d e'), hive)).toEqual({
      pts: 8,
      exact: 3,
      near: 2,
      perfect: false,
    });
    // Reversed: only the middle one is exact; everything else is 2 or 4 spots away.
    expect(scoreOrder(split('e d c b a'), hive)).toEqual({
      pts: 2,
      exact: 1,
      near: 0,
      perfect: false,
    });
    // A full rotation: every thing one spot off except e (four away).
    expect(scoreOrder(split('b c d e a'), hive)).toEqual({
      pts: 4,
      exact: 0,
      near: 4,
      perfect: false,
    });
  });

  it('everyone sending the same order scores a perfect 12 each', () => {
    const same = { x: hive, y: hive, z: hive };
    const built = buildHive(PACK, Object.values(same));
    const delta = scoreRound(same, built?.order ?? []);
    expect(Object.values(delta).map((d) => d.pts)).toEqual([12, 12, 12]);
  });
});

describe('the round’s Queen Bee and lowest', () => {
  const d = (pts: number): { pts: number; exact: number; near: number; perfect: boolean } => ({
    pts,
    exact: 0,
    near: 0,
    perfect: false,
  });

  it('ties share the crown; a 0-point best crowns nobody', () => {
    expect(queensOf({ y: d(8), x: d(8), z: d(2) })).toEqual(['x', 'y']);
    expect(queensOf({ x: d(0), y: d(0) })).toEqual([]);
    expect(queensOf({})).toEqual([]);
  });

  it('the lowest only when scores differ', () => {
    expect(lowsOf({ x: d(8), y: d(2), z: d(2) })).toEqual(['y', 'z']);
    expect(lowsOf({ x: d(5), y: d(5) })).toEqual([]);
    expect(lowsOf({ x: d(5) })).toEqual([]);
  });
});

describe('Twin Brains pairs', () => {
  it('counts the things each pair placed in the same spot', () => {
    const pairs = samePairs({
      b: split('a b c d e'),
      a: split('a b c e d'),
      c: split('e d c b a'),
    });
    expect(pairs).toEqual({ 'a|b': 3, 'a|c': 1, 'b|c': 1 });
    expect(pairKey('z', 'a')).toBe('a|z');
  });
});

describe('input validation', () => {
  it('accepts only the five ids, each once', () => {
    expect(isPermutation(split('e d c b a'), PACK)).toBe(true);
    expect(isPermutation(split('a a c d e'), PACK)).toBe(false);
    expect(isPermutation(split('a b c d x'), PACK)).toBe(false);
    expect(isPermutation(split('a b c d'), PACK)).toBe(false);
    expect(isPermutation(['__proto__', 'b', 'c', 'd', 'e'], PACK)).toBe(false);
  });
});
