// The TV strip's score hold (retro 0ac5d8): a game's rule may be a delay into the phase, so the
// running totals land on the stage's own beat instead of waiting for the next phase.
import { describe, expect, it } from 'vitest';
import { holdFor, releaseHold } from './stripScores';
import type { StripHold } from './stripScores';

describe('the strip hold', () => {
  it('holds each phase afresh: result → answer → result is held again (foundation 8e00d0)', () => {
    let h: StripHold = { key: 'result', released: false };
    h = releaseHold(h, 'result'); // round 1's 1200 ms ran out
    expect(h.released).toBe(true);
    h = holdFor(h, 'answer');
    expect(h).toEqual({ key: 'answer', released: false });
    h = holdFor(h, 'result'); // round 2's result
    expect(h).toEqual({ key: 'result', released: false });
  });
  it('the same phase keeps its release; a late timer from another phase changes nothing', () => {
    const released = releaseHold({ key: 'result', released: false }, 'result');
    expect(holdFor(released, 'result')).toBe(released);
    const answer: StripHold = { key: 'answer', released: false };
    expect(releaseHold(answer, 'result')).toBe(answer);
  });
});
