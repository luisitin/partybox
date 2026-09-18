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
    expect(winnerLineFor(shared, 'Kenji')).toBe('Priya & Sam win!');
  });
  it('counts the rest of a three-way tie in the singular (review-loop #215)', () => {
    const tied = room(
      { Sam: 20, Priya: 20, Kenji: 20, Dev: 10 },
      ['Sam', 'Priya', 'Kenji'],
      [
        { playerId: 'Sam', score: 20, rank: 1 },
        { playerId: 'Priya', score: 20, rank: 1 },
        { playerId: 'Kenji', score: 20, rank: 1 },
        { playerId: 'Dev', score: 10, rank: 4 },
      ],
    );
    expect(winnerLineFor(tied, 'Dev')).toBe('Kenji, Priya & 1 other tie!');
    const four = room(
      { Sam: 20, Priya: 20, Kenji: 20, Dev: 20, Ana: 10 },
      ['Sam', 'Priya', 'Kenji', 'Dev'],
      [
        { playerId: 'Sam', score: 20, rank: 1 },
        { playerId: 'Priya', score: 20, rank: 1 },
        { playerId: 'Kenji', score: 20, rank: 1 },
        { playerId: 'Dev', score: 20, rank: 1 },
        { playerId: 'Ana', score: 10, rank: 5 },
      ],
    );
    expect(winnerLineFor(four, 'Ana')).toBe('Dev, Kenji & 2 others tie!');
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
  it('calls a zero-score game a tie (review-loop #6), whoever asks; a lone player just gets game over', () => {
    const none = room({ Sam: 0, Priya: 0 }, [], []);
    expect(winnerLineFor(none, 'Sam')).toBe("It's a tie!");
    expect(winnerLineFor(room({ Sam: 0 }, [], []), 'Sam')).toBe('Game over');
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
