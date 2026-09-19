// One to go (loop 420): which squares the phone breathes, from the player's own daubs.
import { describe, expect, it } from 'vitest';
import { wantedCells } from '../client/close';

describe('wantedCells', () => {
  it('names the one square a line is missing (the free square counts as daubed)', () => {
    expect(wantedCells('line', [10, 11, 13])).toEqual([14]); // middle row: FREE is 12
    expect(wantedCells('line', [0, 1, 2, 3])).toEqual([4]);
  });
  it('is empty two away, or once the line is complete', () => {
    expect(wantedCells('line', [0, 1, 2])).toEqual([]);
    expect(wantedCells('line', [0, 1, 2, 3, 4])).toEqual([]);
  });
  it('unions every line that is one away', () => {
    // top row wants 4; left column wants 20 (0, 5, 10, 15 daubed).
    expect(wantedCells('line', [0, 1, 2, 3, 5, 10, 15])).toEqual([4, 20]);
  });
  it('follows the round pattern', () => {
    expect(wantedCells('corners', [0, 4, 20])).toEqual([24]);
    expect(wantedCells('corners', [0, 4])).toEqual([]);
    const allBut7 = Array.from({ length: 25 }, (_, i) => i).filter((i) => i !== 7);
    expect(wantedCells('blackout', allBut7)).toEqual([7]);
  });
});
