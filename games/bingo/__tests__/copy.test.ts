// The TV's verdict copy for a failed claim (loop 272): the numbers, by name.
import { describe, expect, it } from 'vitest';
import { whyNot } from '../client/copy';

const card = Array.from({ length: 25 }, (_, i) => (i === 12 ? 0 : i + 1));

describe('whyNot', () => {
  it('names one never-called number and one missed square', () => {
    expect(whyNot({ card, red: [18], missing: [2] })).toBe('19 was never called · 3 was missed');
  });
  it('joins two with "and", and folds more than two', () => {
    expect(whyNot({ card, red: [18, 20], missing: [] })).toBe('19 and 21 were never called');
    expect(whyNot({ card, red: [0, 1, 2, 3], missing: [] })).toBe(
      '1, 2 and 2 more were never called',
    );
  });
  it('never counts FREE as missed, and says nothing when there is nothing to say', () => {
    expect(whyNot({ card, red: [], missing: [12] })).toBe('');
    expect(whyNot({ card, red: [], missing: [] })).toBe('');
  });
});
