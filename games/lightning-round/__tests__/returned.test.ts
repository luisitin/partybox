// I-264: a returning player is timed from their return.
import { describe, expect, it } from 'vitest';
import { pickElapsed } from '../server/phases/question';
import type { State } from '../server/types';

const state = (returnedAt?: number): State =>
  ({
    phase: { id: 'question', startedAt: 0, deadline: 15_000 },
    settings: { answerSeconds: 15 },
    picks: {},
    returnedAt: returnedAt === undefined ? {} : { sam: returnedAt },
  }) as unknown as State;

describe('I-264: timed from the return', () => {
  it('back at 9 s, answers at 10 s: counts like 2.5 s of 15, capped at half the window', () => {
    expect(pickElapsed(state(), 'sam', 10_000)).toBe(10_000); // today: 10 s in
    expect(pickElapsed(state(9_000), 'sam', 10_000)).toBe(7_500); // half the window: the cap
    expect(pickElapsed(state(9_000), 'sam', 14_000)).toBe(12_500); // 5 of 6 s left used
  });
  it('never better than answering on the plain clock', () => {
    expect(pickElapsed(state(1_000), 'sam', 2_000)).toBe(2_000);
  });
});
