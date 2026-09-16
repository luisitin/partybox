// The cue mappings are pure so they can be pinned without an AudioContext.
import { describe, expect, it } from 'vitest';
import { countdownSemitones, joinSemitones, lockSemitones } from './sound';

describe('countdownSemitones', () => {
  it('rises through a major scale from 5 s to 1 s', () => {
    expect([5, 4, 3, 2, 1].map(countdownSemitones)).toEqual([0, 2, 4, 5, 7]);
  });
  it('lands on 880 → 1319 Hz', () => {
    const hz = (s: number): number => Math.round(880 * 2 ** (countdownSemitones(s) / 12));
    expect([5, 4, 3, 2, 1].map(hz)).toEqual([880, 988, 1109, 1175, 1319]);
  });
  it('is flat outside the last five seconds', () => {
    expect(countdownSemitones(0)).toBe(0);
    expect(countdownSemitones(9)).toBe(0);
  });
});

describe('lockSemitones', () => {
  it('climbs whole tones per lock-in and caps at the fifth', () => {
    expect([1, 2, 3, 4, 5, 6, 9].map(lockSemitones)).toEqual([0, 2, 4, 6, 8, 8, 8]);
  });
});

describe('joinSemitones', () => {
  it('steps up a scale per player and wraps after five', () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(joinSemitones)).toEqual([0, 2, 4, 5, 7, 0, 2]);
  });
});
