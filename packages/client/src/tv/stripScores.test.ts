// The TV strip's score hold (retro 0ac5d8): a game's rule may be a delay into the phase, so the
// running totals land on the stage's own beat instead of waiting for the next phase.
import { describe, expect, it } from 'vitest';
import { stripScoresShown } from './stripScores';

describe('stripScoresShown', () => {
  it('passes a yes/no rule straight through', () => {
    expect(stripScoresShown(true, 0)).toBe(true);
    expect(stripScoresShown(false, 60_000)).toBe(false);
  });
  it('holds a delayed rule until the beat, then shows the totals', () => {
    expect(stripScoresShown(1200, 0)).toBe(false);
    expect(stripScoresShown(1200, 1199)).toBe(false);
    expect(stripScoresShown(1200, 1200)).toBe(true);
    expect(stripScoresShown(1200, 8000)).toBe(true);
  });
});
