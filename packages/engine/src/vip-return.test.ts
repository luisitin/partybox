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
  it('the returning host is told who took over', () => {
    let room = applyRoomEvent(lobby(), { type: 'disconnect', now: T0 + 1000, playerId: 'p1' }, deps).room;
    room = tick(room, T0 + 1000 + 40_000);
    expect(room.vipId).toBe('p2');
    const token = room.players['p1']?.token ?? '';
    const back = applyRoomEvent(room, { type: 'join', now: T0 + 50_000, playerId: 'x', token: 'x', name: 'P1', avatarId: 'fox', existingToken: token }, deps);
    expect(back.effects.some((e) => e.type === 'toast' && e.to === 'p1' && e.text.includes('took over as VIP'))).toBe(true);
  });
});
