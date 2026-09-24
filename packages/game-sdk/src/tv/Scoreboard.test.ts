// The board's landing beat (what counts up, and what a game deals beside the board, wait for).
import { describe, expect, it } from 'vitest';
import { boardLandedMs, climbOffset, rankBand, tieEdges, tierOf } from './Scoreboard';

describe('boardLandedMs', () => {
  it('lands one row per 150 ms in a single column, plus the last rise', () => {
    expect(boardLandedMs(1)).toBe(300);
    expect(boardLandedMs(3)).toBe(600);
    expect(boardLandedMs(4)).toBe(750);
  });

  it('halves the step on the two- and three-column tiers, so 16 rows land inside ~1.5 s', () => {
    expect(tierOf(12, false, true)).toBe('dense');
    expect(boardLandedMs(12, { dense: true })).toBe(11 * 75 + 300);
    expect(boardLandedMs(16)).toBe(15 * 75 + 300);
    // A five-row board forced dense lands sooner than the same rows in one column.
    expect(boardLandedMs(5, { dense: true })).toBeLessThan(boardLandedMs(5));
  });

  it('takes the three-column tier from any count when asked (a board under a tall roster)', () => {
    expect(tierOf(12, false, true, 3)).toBe('tight3');
    expect(tierOf(16, false, undefined, 4)).toBe('tight4');
    expect(boardLandedMs(16, { columns: 4 })).toBe(boardLandedMs(16));
    expect(tierOf(9, false, undefined, 3)).toBe('tight3');
    expect(tierOf(9, false, undefined, 2)).toBe('dense');
    // Compact still wins, and the landing time follows the column count.
    expect(tierOf(9, true, undefined, 3)).toBe('compact');
    expect(boardLandedMs(12, { columns: 3 })).toBe(boardLandedMs(12, { dense: true }));
  });

  it('is instant when the board does not stagger', () => {
    expect(boardLandedMs(8, { compact: true })).toBe(0);
    expect(boardLandedMs(8, { stagger: false })).toBe(0);
  });
});

describe('climbOffset (I-027)', () => {
  it('is positive for a row that climbed (it starts the slide that many rows down), negative for one that fell', () => {
    const before = ['a', 'b', 'c'];
    expect(climbOffset(before, 'c', 0)).toBe(2); // third → first: climbed two rows
    expect(climbOffset(before, 'a', 2)).toBe(-2); // first → third: fell two rows
    expect(climbOffset(before, 'b', 1)).toBe(0); // held its place
    expect(climbOffset(before, 'new', 1)).toBe(0); // not on the previous board
  });
});

describe('tie brackets and rank bands (I-146)', () => {
  it('caps a tie at its first and last row, and leaves a lone rank alone', () => {
    const ranks = [1, 2, 2, 4, 4];
    expect(tieEdges(ranks, 0, 5)).toBeNull();
    expect(tieEdges(ranks, 1, 5)).toEqual({ top: true, end: false });
    expect(tieEdges(ranks, 2, 5)).toEqual({ top: false, end: true });
    expect(tieEdges(ranks, 4, 5)).toEqual({ top: false, end: true });
  });

  it('never carries a bracket across a column break', () => {
    // 8 rows in two columns of four: rank 4 runs from the foot of column 1 into column 2.
    const ranks = [1, 2, 2, 4, 4, 4, 4, 4];
    expect(tieEdges(ranks, 3, 4)).toBeNull(); // alone at the foot of its column
    expect(tieEdges(ranks, 4, 4)).toEqual({ top: true, end: false });
    expect(tieEdges(ranks, 7, 4)).toEqual({ top: false, end: true });
  });

  it("labels each split column's first row with the ranks it covers", () => {
    const ranks = [1, 2, 2, 4, 4, 4, 4, 4];
    expect(rankBand(ranks, 0, 4)).toBe('1–4');
    expect(rankBand(ranks, 4, 4)).toBe('4');
    expect(rankBand(ranks, 1, 4)).toBeNull();
    expect(rankBand([1, 2, 3, 4, 5, 6, 7], 4, 4)).toBe('5–7');
  });
});
