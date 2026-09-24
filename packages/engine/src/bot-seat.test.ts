// I-644: a bot gives its seat to a person in a full lobby.
import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { deps, playingRoom, roomWith, T0 } from './test-utils.helper';
import type { RoomState } from './types';

const withBots = (room: RoomState, n: number): RoomState => {
  const players = { ...room.players };
  for (let i = 1; i <= n; i += 1)
    players[`b${i}`] = { ...room.players['p1']!, id: `b${i}`, name: `Bot ${i}`, token: `tb${i}`, isVip: false, joinedAt: T0 + i, bot: { ownerId: null, strategy: 'random' } };
  return { ...room, players, capacity: Object.keys(players).length };
};

const lee = (room: RoomState) =>
  applyRoomEvent(room, { type: 'join', now: T0 + 500, playerId: 'lee', name: 'Lee', avatarId: 'fox', token: 'tlee' } as never, deps);

describe('I-644: bots make room', () => {
  it("a guest takes the newest bot's seat in a full lobby", () => {
    const full = withBots(roomWith(2), 3);
    const r = lee(full);
    expect(r.room.players['lee']).toBeDefined();
    expect(r.room.players['b3']).toBeUndefined();
    expect(Object.keys(r.room.players)).toHaveLength(full.capacity);
    const toasts = r.effects.filter((e) => e.type === 'toast').map((e) => (e as { text: string }).text);
    expect(toasts).toContain('Bot 3 made room for Lee');
  });
  it('a room of people only still refuses', () => {
    const people = { ...roomWith(3), capacity: 3 };
    expect(lee(people).effects.map((e) => (e as { code?: string }).code)).toContain('room_full');
  });
  it('mid-game the bots stay: a full room refuses', () => {
    const game = withBots(playingRoom(2), 2);
    expect(lee(game).effects.map((e) => (e as { code?: string }).code)).toContain('room_full');
  });
});
