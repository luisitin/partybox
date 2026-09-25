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
  room = applyRoomEvent(
    room,
    { type: 'vip', now: T0 + 50, playerId: 'p1', action: { action: 'selectGame', gameId: 'fake' } },
    deps,
  ).room;
  room = applyRoomEvent(
    room,
    { type: 'vip', now: T0 + 60, playerId: 'p1', action: { action: 'startNow' }, seed: 1 },
    deps,
  ).room;
  return room;
}
const drop = (room: RoomState, id: string, now: number): RoomState =>
  applyRoomEvent(room, { type: 'disconnect', now, playerId: id }, deps).room;
const tick = (room: RoomState, now: number): RoomState =>
  applyRoomEvent(room, { type: 'tick', now }, deps).room;

describe('I-746: everyone asleep', () => {
  it('a quiet seat is kept during a game and its phone resumes it', () => {
    let room = playing();
    expect(room.status).toBe('playing');
    const token = room.players['p2']?.token ?? '';
    room = drop(drop(room, 'p1', T0 + 1000), 'p2', T0 + 1000);
    room = tick(room, T0 + 1000 + 125_000);
    expect(Object.keys(room.players).sort()).toEqual(['p1', 'p2']); // not deleted
    const back = applyRoomEvent(
      room,
      {
        type: 'join',
        now: T0 + 130_000,
        playerId: 'p9',
        token: 'new',
        name: 'P2',
        avatarId: 'fox',
        existingToken: token,
      },
      deps,
    );
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

  it('the last phone dropping pauses the game; the first one back resumes it', () => {
    let room = playing();
    room = drop(room, 'p1', T0 + 1000);
    expect(room.asleepSince).toBeUndefined();
    room = drop(room, 'p2', T0 + 1100);
    expect(room.asleepSince).toBe(T0 + 1100);
    const token = room.players['p1']?.token ?? '';
    room = applyRoomEvent(
      room,
      {
        type: 'join',
        now: T0 + 5000,
        playerId: 'p9',
        token: 'x',
        name: 'P1',
        avatarId: 'fox',
        existingToken: token,
      },
      deps,
    ).room;
    expect(room.asleepSince).toBeUndefined();
  });

  it('nobody back in 5 minutes ends the game to the lobby', () => {
    let room = drop(drop(playing(), 'p1', T0 + 1000), 'p2', T0 + 1000);
    room = tick(room, T0 + 1000 + 5 * 60_000);
    expect(room.status).toBe('lobby');
    expect(room.asleepSince).toBeUndefined();
  });
  it('a pause the VIP made before everyone dropped is still theirs after the wake', () => {
    let room = playing();
    room = applyRoomEvent(
      room,
      { type: 'vip', now: T0 + 500, playerId: 'p1', action: { action: 'pause' } },
      deps,
    ).room;
    expect(room.game?.state.phase.paused).toBeDefined();
    room = drop(drop(room, 'p1', T0 + 1000), 'p2', T0 + 1000);
    expect(room.asleepSince).toBe(T0 + 1000);
    const token = room.players['p1']?.token ?? '';
    room = applyRoomEvent(
      room,
      {
        type: 'join',
        now: T0 + 5000,
        playerId: 'p9',
        token: 'x',
        name: 'P1',
        avatarId: 'fox',
        existingToken: token,
      },
      deps,
    ).room;
    expect(room.asleepSince).toBeUndefined();
    expect(room.asleepKeptPause).toBeUndefined();
    expect(room.game?.state.phase.paused).toBeDefined(); // still paused: the VIP resumes it
  });

  it('a game that ends while asleep leaves no flag for the next one', () => {
    let room = drop(drop(playing(), 'p1', T0 + 1000), 'p2', T0 + 1000);
    room = tick(room, T0 + 1000 + 5 * 60_000);
    expect(room.status).toBe('lobby');
    expect(room.asleepKeptPause).toBeUndefined();
    expect(room.asleepSince).toBeUndefined();
  });
});
