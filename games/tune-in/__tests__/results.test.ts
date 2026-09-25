// ADR-052 results: teams name the winning team (or a draw), co-op crowns everyone at Crystal clear
// or better and nobody below it (spec §5.7), with the rating as the results' headline.
import { describe, expect, it } from 'vitest';
import { results } from '../server/scoring';
import type { State } from '../server/types';
import { start } from './helpers';

function done(s: State, patch: Partial<State>): State {
  return { ...s, ...patch, phase: { ...s.phase, id: 'done' } };
}

describe('teams', () => {
  it('name the team with more points, its players the winners', () => {
    const s0 = start(6, { mode: 'teams' });
    const teams = s0.teams ?? { sun: [], moon: [] };
    const scores = Object.fromEntries([
      ...teams.sun.map((id) => [id, 10] as const),
      ...teams.moon.map((id) => [id, 7] as const),
    ]);
    const r = results(done(s0, { team: { sun: 10, moon: 7 }, scores }));
    expect(r?.outcome).toEqual({
      kind: 'teams',
      winner: 'sun',
      teams: [
        { id: 'sun', name: 'Sun', mark: '▲', members: teams.sun },
        { id: 'moon', name: 'Moon', mark: '●', members: teams.moon },
      ],
    });
    expect([...(r?.winnerIds ?? [])].sort()).toEqual([...teams.sun].sort());
  });

  it('call equal totals a draw', () => {
    const s0 = start(4, { mode: 'teams' });
    const scores = Object.fromEntries(s0.seats.map((id) => [id, 5] as const));
    const r = results(done(s0, { team: { sun: 5, moon: 5 }, scores }));
    expect(r?.outcome?.kind === 'teams' && r.outcome.winner).toBeNull();
  });
});

describe('co-op', () => {
  it('crowns everyone at Crystal clear, with the rating as the headline', () => {
    const s0 = start(3, { mode: 'coop' });
    // 10 of 16 = 62.5 %: Crystal clear (55–74 %).
    const scores = Object.fromEntries(s0.seats.map((id) => [id, 10] as const));
    const r = results(done(s0, { coopTotal: 10, played: 4, scores }));
    expect(r?.outcome).toEqual({ kind: 'coop', won: true });
    expect(r?.headline).toBe('📡 Crystal clear!');
    expect(r?.winnerIds.length).toBe(3);
  });

  it('crowns nobody below it', () => {
    const s0 = start(3, { mode: 'coop' });
    const scores = Object.fromEntries(s0.seats.map((id) => [id, 4] as const));
    const r = results(done(s0, { coopTotal: 4, played: 4, scores }));
    expect(r?.outcome).toEqual({ kind: 'coop', won: false });
    expect(r?.headline).toBe('📺 Static.');
    expect(r?.winnerIds).toEqual([]);
  });
});

describe('solo', () => {
  it('has no outcome: the shell names the winner', () => {
    const s0 = start(4, { mode: 'solo' });
    const r = results(done(s0, {}));
    expect(r?.outcome).toBeUndefined();
    expect(r?.headline).toBeUndefined();
  });
});
