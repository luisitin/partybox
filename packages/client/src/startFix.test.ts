// I-667 A: the start fix.
import { describe, expect, it } from 'vitest';
import type { CatalogEntry, PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { en } from './i18n-en';
import { es } from './i18n-es';
import { fixLabel, startFix } from './startFix';

const game = (min: number, max: number, supportsBots = true): CatalogEntry => ({
  id: 'g',
  name: 'G',
  icon: '🎲',
  tagline: '',
  minPlayers: min,
  maxPlayers: max,
  estimatedMinutes: 10,
  tags: [],
  presence: 'anywhere',
  supportsBots,
});
const player = (id: string, bot = false): PlayerPublic =>
  ({
    id,
    name: id,
    avatarId: 'fox',
    connected: true,
    isVip: false,
    spectator: false,
    joinedAt: 0,
    ...(bot ? { bot: { ownerId: 'p1', strategy: 'random' } } : {}),
  }) as PlayerPublic;
const room = (people: number, bots: number, capacity = 16): RoomSnapshot =>
  ({
    players: [
      ...Array.from({ length: people }, (_, i) => player(`p${i + 1}`)),
      ...Array.from({ length: bots }, (_, i) => player(`b${i + 1}`, true)),
    ],
    capacity,
  }) as unknown as RoomSnapshot;

describe('I-667: the start fix', () => {
  it('over the cap: the newest bots, exactly as many as needed', () => {
    const fix = startFix(room(2, 10), game(3, 8));
    expect(fix).toEqual({ kind: 'remove', botIds: ['b7', 'b8', 'b9', 'b10'], all: false });
    expect(fixLabel(fix!, en.fix)).toBe('Remove 4 bots to play');
    expect(fixLabel(fix!, es.fix)).toBe('Quitar 4 bots para jugar');
  });
  it('people over the cap are never removed', () => {
    expect(startFix(room(10, 1), game(3, 8))).toBeNull();
  });
  it('a game without bots: every bot', () => {
    const fix = startFix(room(3, 2), game(3, 8, false));
    expect(fix).toMatchObject({ kind: 'remove', all: true });
    expect(fixLabel(fix!, en.fix)).toBe('Remove the 2 bots');
  });
  it('under the minimum: add bots when the game takes them and the fixer may', () => {
    const fix = startFix(room(2, 0), game(3, 8));
    expect(fix).toEqual({ kind: 'add', count: 1 });
    expect(fixLabel(fix!, en.fix)).toBe('Add 1 bot to play');
    expect(startFix(room(2, 0), game(3, 8), 0)).toBeNull();
    expect(startFix(room(2, 0), game(3, 8, false))).toBeNull();
  });
  it('a room that fits needs no fix', () => {
    expect(startFix(room(4, 0), game(3, 8))).toBeNull();
  });
});
