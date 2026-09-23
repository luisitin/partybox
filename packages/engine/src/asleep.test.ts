// I-746: a room whose every phone went quiet during a game.
import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { nextWakeAt } from './runner';
import { T0, deps, joinEvent } from './test-utils.helper';
import { createRoom } from './room';
import type { RoomState } from './types';

function playing(): RoomState {
  let room = createRoom({ code: 'ABCD', now: T0 });
  for (let i = 1; i <= 2; i++) room = applyRoomEvent(room, joinEvent(i), deps).room;
  room = applyRoomEvent(room, { type: 'vip', now: T0 + 50, playerId: 'p1', action: { action: 'selectGame', gameId: 'fake' } }, deps).room;
  room = applyRoomEvent(room, { type: 'vip', now: T0 + 60, playerId: 'p1', action: { action: 'start' }, seed: 1 }, deps).room;
  return room;
}
const drop = (room: RoomState, id: string, now: number): RoomState =>
  applyRoomEvent(room, { type: 'disconnect', now, playerId: id }, deps).room;
const tick = (room: RoomState, now: number): RoomState => applyRoomEvent(room, { type: 'tick', now }, deps).room;

describe('I-746: everyone asleep', () => {
  it('a quiet seat is kept during a game and its phone resumes it', () => {
    let room = playing();
    expect(room.status).toBe('playing');
    const token = room.players['p2']?.token ?? '';
    room = drop(drop(room, 'p1', T0 + 1000), 'p2', T0 + 1000);
    room = tick(room, T0 + 1000 + 125_000);
    expect(Object.keys(room.players).sort()).toEqual(['p1', 'p2']); // not deleted
    const back = applyRoomEvent(room, { type: 'join', now: T0 + 130_000, playerId: 'p9', token: 'new', name: 'P2', avatarId: 'fox', existingToken: token }, deps);
    expect(back.effects.find((e) => e.type === 'welcome')).toMatchObject({ playerId: 'p2' });
  });

  it('the host timer is never scheduled in the past while nobody can take over', () => {
    let room = playing();
    room = drop(drop(room, 'p2', T0 + 1000), 'p1', T0 + 1000);
    const now = T0 + 1000 + 40_000; // past the 30 s handover, nobody to hand over to
    room = tick(room, now);
    const at = nextWakeAt(room);
    expect(at === null || at > now).toBe(true);
  });
});
