// I-392 A: a wrong claim is judged on the line the player daubed.
import { describe, expect, it } from 'vitest';
import { evaluate } from '../server/patterns';

const card = Array.from({ length: 25 }, (_, i) => (i === 12 ? 0 : i + 1));

describe('I-392: the line a claim is judged on', () => {
  it('a top row of daubs (mostly never called) is judged on the top row, not the middle one', () => {
    const called = [2, 50, 51];
    const claim = evaluate('p', 0, card, [0, 1, 2, 3, 4], called, 'line');
    expect(claim.cells).toEqual([0, 1, 2, 3, 4]);
    expect(claim.valid).toBe(false);
    expect(claim.red).toEqual([0, 2, 3, 4]);
  });
  it('a real bingo still wins on its line', () => {
    const called = [16, 17, 18, 19, 20];
    const claim = evaluate('p', 0, card, [15, 16, 17, 18, 19, 0, 1], called, 'line');
    expect(claim.valid).toBe(true);
    expect(claim.cells).toEqual([15, 16, 17, 18, 19]);
  });
});
