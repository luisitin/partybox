// The phone's standing line (loop #428): a level board is not a lead.
import { describe, expect, it } from 'vitest';
import { rankLine } from '../client/rankLine';

const rows = (...scores: number[]) => scores.map((score) => ({ score }));

describe('rankLine', () => {
  it('names the rank and the points once anyone has scored', () => {
    expect(rankLine({ myRank: 1, myScore: 1, standings: rows(1, 0, 0) }, false)).toBe(
      '#1 of 3 · 1 point',
    );
    expect(rankLine({ myRank: 3, myScore: 0, standings: rows(2, 1, 0) }, true)).toBe(
      'Final: #3 of 3 · 0 points',
    );
  });

  it('says nobody has scored while the board is level at 0', () => {
    const level = { myRank: 1, myScore: 0, standings: rows(0, 0, 0, 0) };
    expect(rankLine(level, false)).toBe('No points yet');
    expect(rankLine(level, true)).toBe('Final: everyone on 0');
  });

  it('keeps the rank for a room of one', () => {
    expect(rankLine({ myRank: 1, myScore: 0, standings: rows(0) }, false)).toBe(
      '#1 of 1 · 0 points',
    );
  });
});
