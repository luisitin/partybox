// The board's landing beat (what counts up, and what a game deals beside the board, wait for).
import { describe, expect, it } from 'vitest';
import { boardLandedMs, tierOf } from './Scoreboard';

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

  it('is instant when the board does not stagger', () => {
    expect(boardLandedMs(8, { compact: true })).toBe(0);
    expect(boardLandedMs(8, { stagger: false })).toBe(0);
  });
});
