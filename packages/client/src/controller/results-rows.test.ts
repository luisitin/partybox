// The phone's first-person results copy is pure: pin it without rendering.
import { describe, expect, it } from 'vitest';
import type { RoomSnapshot } from '@partybox/shared';
import { ordinal } from '../i18n';
import { myRow, winnerLineFor } from './results-rows';

type Rank = { playerId: string; score: number; rank: number };

function room(scores: Record<string, number>, winnerIds: string[], ranking: Rank[]): RoomSnapshot {
  const players = Object.keys(scores).map((id) => ({ id, name: id, avatarId: 'fox' }));
  return {
    code: 'ABCD',
    status: 'results',
    locked: false,
    capacity: 16,
    players: [],
    vip: null,
    selectedGameId: null,
    settings: {},
    games: [],
    results: { gameId: 'g', results: { scores, ranking, winnerIds }, players },
    canStart: { ok: true },
  } as unknown as RoomSnapshot;
}

const three = room(
  { Sam: 30, Priya: 20, Kenji: 10 },
  ['Sam'],
  [
    { playerId: 'Sam', score: 30, rank: 1 },
    { playerId: 'Priya', score: 20, rank: 2 },
    { playerId: 'Kenji', score: 10, rank: 3 },
  ],
);

describe('winnerLineFor', () => {
  it('speaks to the single winner in the first person, names them for everyone else', () => {
    expect(winnerLineFor(three, 'Sam')).toBe('You win! 🏆');
    expect(winnerLineFor(three, 'Priya')).toBe('Sam wins!');
  });
  it('shares first place', () => {
    const shared = room(
      { Sam: 30, Priya: 30, Kenji: 10 },
      ['Sam', 'Priya'],
      [
        { playerId: 'Sam', score: 30, rank: 1 },
        { playerId: 'Priya', score: 30, rank: 1 },
        { playerId: 'Kenji', score: 10, rank: 3 },
      ],
    );
    expect(winnerLineFor(shared, 'Sam')).toBe('You tie for first! 🏆');
    expect(winnerLineFor(shared, 'Kenji')).toBe('Sam & Priya win!');
  });
  it('calls an all-way tie a tie for everyone', () => {
    const all = room(
      { Sam: 10, Priya: 10 },
      ['Sam', 'Priya'],
      [
        { playerId: 'Sam', score: 10, rank: 1 },
        { playerId: 'Priya', score: 10, rank: 1 },
      ],
    );
    expect(winnerLineFor(all, 'Sam')).toBe("It's a tie!");
  });
  it('says game over when nobody scored, whoever asks', () => {
    const none = room({ Sam: 0, Priya: 0 }, [], []);
    expect(winnerLineFor(none, 'Sam')).toBe('Game over');
  });
  it('falls back to the shared line for a spectator', () => {
    expect(winnerLineFor(three, 'Ghost')).toBe('Sam wins!');
  });
});

describe('myRow', () => {
  it('finds my ranking entry, or nothing for a spectator', () => {
    expect(myRow(three, 'Priya')).toMatchObject({ rank: 2, score: 20 });
    expect(myRow(three, 'Ghost')).toBeUndefined();
  });
});

describe('ordinal', () => {
  it('handles the teens and the twenties', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '23rd',
      '101st',
      '111th',
    ]);
  });
});
