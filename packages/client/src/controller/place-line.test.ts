// I-329: the non-winner's line on the results phone.
import { describe, expect, it } from 'vitest';
import type { RoomSnapshot } from '@partybox/shared';
import { t } from '../i18n';
import { placeLine } from './results-rows';

type Rank = { playerId: string; score: number; rank: number };

function room(ranking: Rank[], winnerIds: string[], bots: string[] = []): RoomSnapshot {
  const scores = Object.fromEntries(ranking.map((r) => [r.playerId, r.score]));
  const players = ranking.map((r) => ({ id: r.playerId, name: r.playerId, avatarId: 'fox' }));
  return {
    players: ranking.map((r) => ({
      id: r.playerId,
      name: r.playerId,
      ...(bots.includes(r.playerId) ? { bot: { ownerId: null, strategy: 'random' } } : {}),
    })),
    results: { gameId: 'g', results: { scores, ranking, winnerIds, awards: [] }, players },
  } as unknown as RoomSnapshot;
}

const four = (bots: string[] = []): RoomSnapshot =>
  room(
    [
      { playerId: 'Sam', score: 90, rank: 1 },
      { playerId: 'Priya', score: 50, rank: 2 },
      { playerId: 'Kenji', score: 30, rank: 3 },
      { playerId: 'Lou', score: 10, rank: 4 },
    ],
    ['Sam'],
    bots,
  );

const all = (v: unknown): string[] =>
  (Array.isArray(v) ? v : [v]).map((x) => (typeof x === 'function' ? x(40) : x));

describe('I-329: placeLine', () => {
  it('says nothing to the winner', () => {
    expect(placeLine(four(), 'Sam')).toBeNull();
  });
  it('runner-up gets the gap, the middle its place, last is last', () => {
    expect(placeLine(four(), 'Priya')).toMatch(/40 pts/);
    expect(placeLine(four(), 'Kenji')).toMatch(/^3rd/);
    expect(all(t.results.placeLast)).toContain(placeLine(four(), 'Lou'));
  });
  it('a bot winner is named as a bot to the people it beat — not to the other bots', () => {
    expect(all(t.results.placeBot)).toContain(placeLine(four(['Sam']), 'Priya'));
    expect(all(t.results.placeBot)).toContain(placeLine(four(['Sam']), 'Kenji'));
    expect(all(t.results.placeLast)).toContain(placeLine(four(['Sam']), 'Lou'));
    expect(all(t.results.placeBot)).not.toContain(placeLine(four(['Sam', 'Kenji']), 'Kenji'));
  });
  it('the same line on every render', () => {
    expect(placeLine(four(), 'Kenji')).toBe(placeLine(four(), 'Kenji'));
  });
  it('nothing when nobody scored', () => {
    const zero = room(
      [
        { playerId: 'Sam', score: 0, rank: 1 },
        { playerId: 'Priya', score: 0, rank: 1 },
      ],
      ['Sam', 'Priya'],
    );
    expect(placeLine(zero, 'Priya')).toBeNull();
  });
  it('B: three lines per outcome, and different games can pick different ones', () => {
    if (!Array.isArray(t.results.placeBot)) return;
    const lines = new Set<string | null>();
    for (let s = 0; s < 30; s += 1) {
      const r = room(
        [
          { playerId: 'Sam', score: 90 + s, rank: 1 },
          { playerId: 'Kenji', score: 30, rank: 2 },
          { playerId: 'Lou', score: 10, rank: 3 },
        ],
        ['Sam'],
      );
      lines.add(placeLine(r, 'Lou'));
    }
    expect(lines.size).toBe(3);
  });
  it('a tie for first is a win, not runner-up; a spectator gets nothing', () => {
    const tied = room(
      [
        { playerId: 'Sam', score: 90, rank: 1 },
        { playerId: 'Priya', score: 90, rank: 1 },
        { playerId: 'Lou', score: 10, rank: 3 },
      ],
      ['Sam', 'Priya'],
    );
    expect(placeLine(tied, 'Priya')).toBeNull();
    expect(all(t.results.placeLast)).toContain(placeLine(tied, 'Lou'));
    expect(placeLine(four(), 'Nobody')).toBeNull();
  });
  it('two players: second is the runner-up, with the gap', () => {
    const two = room(
      [
        { playerId: 'Sam', score: 90, rank: 1 },
        { playerId: 'Priya', score: 89, rank: 2 },
      ],
      ['Sam'],
    );
    expect(placeLine(two, 'Priya')).toMatch(/ 1 pt /);
  });
  it('co-op and teams games: the outcome headline speaks, no line', () => {
    const coop = four(['Sam']);
    (coop.results!.results as { outcome?: unknown }).outcome = { kind: 'coop', won: true };
    expect(placeLine(coop, 'Priya')).toBeNull();
    expect(placeLine(coop, 'Lou')).toBeNull();
  });
});
