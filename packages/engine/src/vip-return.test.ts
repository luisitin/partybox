// I-347: the VIP role and a host whose phone was away.
import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { T0, deps, joinEvent } from './test-utils.helper';
import { createRoom } from './room';
import type { RoomState } from './types';

function lobby(): RoomState {
  let room = createRoom({ code: 'ABCD', now: T0 });
  for (let i = 1; i <= 2; i++) room = applyRoomEvent(room, joinEvent(i), deps).room;
  return room;
}
const tick = (room: RoomState, now: number): RoomState => applyRoomEvent(room, { type: 'tick', now }, deps).room;

describe('I-347: the VIP comes back', () => {
  it('in the lobby the role does not pass on', () => {
    let room = applyRoomEvent(lobby(), { type: 'disconnect', now: T0 + 1000, playerId: 'p1' }, deps).room;
    room = tick(room, T0 + 1000 + 40_000);
    expect(room.vipId).toBe('p1');
  });
  it('the former VIP can take the role back; nobody else can', () => {
    let room = { ...lobby(), status: 'playing' as const };
    room = { ...room, formerVip: 'p1', vipId: 'p2', players: { ...room.players, p1: { ...room.players['p1']!, isVip: false }, p2: { ...room.players['p2']!, isVip: true } } };
    const other = applyRoomEvent(room, { type: 'vip', now: T0 + 60_000, playerId: 'p2', action: { action: 'reclaimVip' } }, deps).room;
    expect(other.vipId).toBe('p2');
    const back = applyRoomEvent(room, { type: 'vip', now: T0 + 60_000, playerId: 'p1', action: { action: 'reclaimVip' } }, deps).room;
    expect(back.vipId).toBe('p1');
    expect(back.formerVip).toBeUndefined();
  });
});
