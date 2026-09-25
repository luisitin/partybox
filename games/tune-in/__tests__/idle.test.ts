// Spec §5.17 "Everyone idle: psychics send nothing, so every round is void and the game ends
// quickly" — IDLE_VOIDS void rounds in a row end it; a clue in between starts the count again.
import { describe, expect, it } from 'vitest';
import { IDLE_VOIDS } from '../server/types';
import type { State } from '../server/types';
import { start, timer, toClue, toDial } from './helpers';

/** Let every deadline pass until the game is done (nobody sends anything). */
function runIdle(s: State): State {
  for (let i = 0; i < 200 && s.phase.id !== 'done'; i += 1) s = timer(s);
  return s;
}

describe('an idle room', () => {
  it(`ends after ${IDLE_VOIDS} void rounds in a row`, () => {
    for (const mode of ['solo', 'coop', 'teams'] as const) {
      const s = runIdle(start(mode === 'coop' ? 3 : 6, { mode }));
      expect(s.phase.id, mode).toBe('done');
      expect(s.turn.n, mode).toBe(IDLE_VOIDS);
    }
  });

  it('starts the count again after a round with a clue', () => {
    let s = start(5, { mode: 'solo' });
    s = toClue(s); // past the ready-up and its 3 · 2 · 1 to round 1's clue: void
    s = timer(s); // clue runs out → void reveal
    s = timer(s); // → round 2
    expect(s.voidStreak).toBe(1);
    s = toDial(s); // round 2 gets a clue
    for (let i = 0; i < 20 && s.phase.id !== 'clue'; i += 1) s = timer(s);
    expect(s.voidStreak).toBe(0);
  });
});
