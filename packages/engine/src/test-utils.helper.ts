// Shared helpers for engine tests: a room with N joined players and a typed event applier.
import type { VipAction } from '@partybox/shared';
import { fakeGame } from './fake-game.helper';
import { applyRoomEvent, createRoom } from './room';
import type { ApplyResult, Effect, EngineDeps, RoomEvent, RoomState } from './types';

export const deps: EngineDeps = { games: { fake: fakeGame } };

export const T0 = 1_000_000;

export function joinEvent(i: number, now = T0 + i, name = `P${i}`): RoomEvent {
  return { type: 'join', now, playerId: `p${i}`, token: `t${i}`, name, avatarId: 'fox' };
}

/** A lobby with players p1..pN (p1 is VIP). */
export function roomWith(n: number): RoomState {
  let room = createRoom({ code: 'ABCD', now: T0 });
  for (let i = 1; i <= n; i++) room = applyRoomEvent(room, joinEvent(i), deps).room;
  return room;
}

export function vip(
  room: RoomState,
  action: VipAction,
  now = T0 + 100,
  playerId = 'p1',
  seed?: number,
): ApplyResult {
  return applyRoomEvent(room, { type: 'vip', now, playerId, action, seed }, deps);
}

/** A room already playing the fake game with N players. */
export function playingRoom(n = 3, now = T0 + 100): RoomState {
  const selected = vip(roomWith(n), { action: 'selectGame', gameId: 'fake' }, now).room;
  return vip(selected, { action: 'start' }, now + 1, 'p1', 42).room;
}

export function effectTypes(effects: Effect[]): string[] {
  return effects.map((e) => e.type);
}

export function errorsOf(effects: Effect[]): string[] {
  return effects.flatMap((e) => (e.type === 'error' ? [e.code] : []));
}

export function toasts(effects: Effect[]): string[] {
  return effects.flatMap((e) => (e.type === 'toast' ? [e.text] : []));
}
