// I-388: "I'm here" in the lobby.
import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { deps, roomWith, T0, vip } from './test-utils.helper';
import { snapshot } from './views';
import type { RoomState } from './types';

const here = (room: RoomState, playerId: string, on = true): RoomState =>
  applyRoomEvent(room, { type: 'here', now: T0 + 50, playerId, on }, deps).room;

describe('I-388: I am here', () => {
  it('a guest says so and can take it back; a repeat changes nothing', () => {
    let room = here(roomWith(3), 'p2');
    expect(snapshot(room, deps).here).toEqual(['p2']);
    expect(here(room, 'p2')).toBe(room);
    room = here(room, 'p2', false);
    expect(snapshot(room, deps).here).toEqual([]);
  });
  it('only in the lobby, and a game start clears it', () => {
    const room = here(here(roomWith(3), 'p2'), 'p3');
    const picking = vip(room, { action: 'selectGame', gameId: 'fake' }, T0 + 70).room;
    expect(here(picking, 'p1')).toBe(picking);
    const started = vip(picking, { action: 'start' }, T0 + 71, 'p1', 42).room;
    expect(snapshot(started, deps).here).toEqual([]);
  });
});
