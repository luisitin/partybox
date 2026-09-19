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

  it('takes the three-column tier from any count when asked (a board under a tall roster)', () => {
    expect(tierOf(12, false, true, 3)).toBe('tight3');
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
