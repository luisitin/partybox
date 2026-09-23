import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createRoom } from '@partybox/engine';
import type { RoomState } from '@partybox/engine';
import { createRoomStore, restoredRoom } from './room-store';

const withPlayer = (): RoomState => {
  const room = createRoom({ code: 'HGXF', now: 1 });
  return {
    ...room,
    vipId: 'p1',
    players: {
      p1: { id: 'p1', name: 'Sam', avatarId: 'fox', token: 't1', isVip: true, connected: true, joinedAt: 1, disconnectedAt: null, spectator: false },
    },
  };
};

describe('I-744 C: rooms survive a restart', () => {
  it('saves the rooms and loads them back', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'rooms-'));
    const store = createRoomStore(dir);
    expect(store.load()).toBeNull();
    store.save({ house: 'HGXF', rooms: [withPlayer()] });
    await new Promise((r) => setTimeout(r, 450));
    const back = createRoomStore(dir).load();
    expect(back?.house).toBe('HGXF');
    expect(back?.rooms[0]?.players['p1']?.token).toBe('t1');
  });

  it('a restored room has nobody connected and no running game', () => {
    const playing = { ...withPlayer(), status: 'playing' as const };
    const r = restoredRoom(playing, 99);
    expect(r.status).toBe('lobby');
    expect(r.game).toBeNull();
    expect(r.players['p1']).toMatchObject({ connected: false, disconnectedAt: 99, isVip: true });
  });
});
