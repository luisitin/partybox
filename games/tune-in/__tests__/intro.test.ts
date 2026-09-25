// The start is the shell's (ADR-053): its stage shows the rules, takes everyone's READY and plays
// the 3 · 2 · 1 before init. Tune In has no ready-up of its own: solo and co-op start at turn 1's
// clue; teams first see a short roster card (no READY, no clock shown) that ends by itself.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { TEAMS_CARD_MS } from '../server/types';
import { start, T0, timer, vip } from './helpers';

describe("the start after the shell's stage", () => {
  it('solo and co-op start at turn 1: the psychic is thinking of a clue', () => {
    for (const mode of ['solo', 'coop'] as const) {
      const s = start(4, { mode });
      expect(s.phase.id, mode).toBe('clue');
      expect(s.turn.n, mode).toBe(1);
      expect(s.phase.deadline, mode).not.toBeNull();
    }
  });

  it('teams see their sides for TEAMS_CARD_MS, then turn 1', () => {
    let s = start(6, { mode: 'teams' });
    expect(s.phase).toEqual({ id: 'intro', startedAt: T0, deadline: T0 + TEAMS_CARD_MS });
    expect(s.turn.team).not.toBeNull();
    const tv = game.tvView(s);
    expect(tv.teams?.sun.length).toBeGreaterThan(0);
    expect(tv.turn.psychic).toBe(s.turn.psychic);
    s = timer(s);
    expect(s.phase.id).toBe('clue');
    expect(s.turn.n).toBe(1);
  });

  it('the VIP can skip the teams card', () => {
    const s = vip(start(6, { mode: 'teams' }), 'skip');
    expect(s.phase.id).toBe('clue');
  });

  it('nobody taps anything on the card: an input there changes nothing', () => {
    const s = start(6, { mode: 'teams' });
    const id = s.seats[0] as string;
    expect(
      game.reduce(s, { type: 'input', now: T0 + 10, playerId: id, input: { type: 'lock' } }),
    ).toBe(s);
  });
});
