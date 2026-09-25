// Part 00 §1.3 and rulings 3–4: fit reasons, useful chips, and the list's order.
import { describe, expect, it } from 'vitest';
import type { CatalogEntry, PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { chipsFor, fitOf, matchesChip, playedTonight, sortGames } from './model';

const game = (id: string, over: Partial<CatalogEntry> = {}): CatalogEntry => ({
  id,
  name: id[0]!.toUpperCase() + id.slice(1),
  icon: '🎲',
  tagline: '',
  minPlayers: 2,
  maxPlayers: 8,
  estimatedMinutes: 10,
  tags: ['words'],
  presence: 'anywhere',
  supportsBots: true,
  ...over,
});
const people = (n: number, bots = 0): PlayerPublic[] =>
  Array.from({ length: n + bots }, (_, i) => ({
    id: `p${i}`,
    name: `P${i}`,
    avatarId: 'fox',
    isVip: i === 0,
    connected: true,
    spectator: false,
    joinedAt: i,
    ...(i >= n ? { bot: { ownerId: null, strategy: 'idle' as const } } : {}),
  }));
const room = (n: number, bots = 0, votes: Record<string, string> = {}) =>
  ({ players: people(n, bots), votes }) as Pick<RoomSnapshot, 'players' | 'votes'>;

describe('fit', () => {
  it('says why a game does not fit: too few, too many, or bots it cannot seat', () => {
    expect(fitOf(game('a', { minPlayers: 4 }), room(3))).toEqual({
      ok: false,
      why: 'needs',
      min: 4,
      n: 3,
    });
    expect(fitOf(game('a', { maxPlayers: 4 }), room(5))).toMatchObject({ why: 'tooMany' });
    expect(fitOf(game('a', { supportsBots: false }), room(3, 1))).toMatchObject({ why: 'noBots' });
    expect(fitOf(game('a'), room(3, 1))).toEqual({ ok: true });
  });
});

describe('chips', () => {
  it('shows All and only chips that narrow the list', () => {
    const games = [
      game('a', { tags: ['words', 'quick'] }),
      game('b', { tags: ['comedy'] }),
      game('c', { tags: ['comedy'], presence: 'voice-if-remote' }),
    ];
    expect(chipsFor(games)).toEqual(['all', 'quick', 'words', 'comedy', 'anywhere']);
    expect(matchesChip(games[2]!, 'anywhere')).toBe(false);
  });
  it('drops a chip every game matches', () => {
    expect(chipsFor([game('a'), game('b')])).toEqual(['all']);
  });
});

describe('order (ruling 3): fits, then votes, then NEW, then A–Z', () => {
  it('sorts by each key in turn', () => {
    const games = [
      game('zeta'),
      game('alpha'),
      game('big', { minPlayers: 6 }),
      game('fresh', { isNew: true }),
      game('liked'),
    ];
    const order = sortGames(games, room(3, 0, { p1: 'liked', p2: 'liked', p0: 'zeta' })).map(
      (g) => g.id,
    );
    expect(order).toEqual(['liked', 'zeta', 'fresh', 'alpha', 'big']);
  });
  it('a vote never lifts a game that does not fit above one that does', () => {
    const order = sortGames(
      [game('big', { minPlayers: 6 }), game('ok')],
      room(3, 0, { p1: 'big' }),
    );
    expect(order.map((g) => g.id)).toEqual(['ok', 'big']);
  });
});

describe('played tonight', () => {
  it('reads the room’s night', () => {
    const tonight = [{ gameId: 'a', winners: [], botsWon: false }];
    expect(playedTonight({ tonight })).toEqual(new Set(['a']));
    expect(playedTonight({})).toEqual(new Set());
  });
});
