// I-667 A: the start fix.
import { describe, expect, it } from 'vitest';
import type { GameSummary, PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { startFix } from './startFix';

const game = (min: number, max: number, supportsBots = true): GameSummary => ({
  id: 'g', name: 'G', tagline: '', description: '', minPlayers: min, maxPlayers: max,
  estimatedMinutes: 10, tags: [], settings: [], supportsBots,
});
const player = (id: string, bot = false): PlayerPublic =>
  ({ id, name: id, avatarId: 'fox', connected: true, isVip: false, spectator: false, joinedAt: 0,
     ...(bot ? { bot: { ownerId: 'p1', strategy: 'random' } } : {}) }) as PlayerPublic;
const room = (people: number, bots: number, capacity = 16): RoomSnapshot =>
  ({ players: [
      ...Array.from({ length: people }, (_, i) => player(`p${i + 1}`)),
      ...Array.from({ length: bots }, (_, i) => player(`b${i + 1}`, true)),
    ], capacity }) as unknown as RoomSnapshot;

describe('I-667: the start fix', () => {
  it('over the cap: the newest bots, exactly as many as needed', () => {
    const fix = startFix(room(2, 10), game(3, 8));
    expect(fix).toEqual({ kind: 'remove', botIds: ['b7', 'b8', 'b9', 'b10'], label: 'Remove 4 bots to play' });
  });
  it('people over the cap are never removed', () => {
    expect(startFix(room(10, 1), game(3, 8))).toBeNull();
  });
  it('a game without bots: every bot', () => {
    expect(startFix(room(3, 2), game(3, 8, false))).toMatchObject({ kind: 'remove', label: 'Remove the 2 bots' });
  });
  it('under the minimum: add bots when the game takes them and the fixer may', () => {
    expect(startFix(room(2, 0), game(3, 8))).toEqual({ kind: 'add', count: 1, label: 'Add 1 bot to play' });
    expect(startFix(room(2, 0), game(3, 8), 0)).toBeNull();
    expect(startFix(room(2, 0), game(3, 8, false))).toBeNull();
  });
  it('a room that fits needs no fix', () => {
    expect(startFix(room(4, 0), game(3, 8))).toBeNull();
  });
});
