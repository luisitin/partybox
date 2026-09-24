import { describe, expect, it } from 'vitest';
import { LIMITS } from '@partybox/shared';
import { applyRoomEvent, createRoom } from './room';
import type { RoomEvent } from './types';
import { playerInfos } from './runner';
import { publicPlayers } from './views';
import {
  deps,
  effectTypes,
  errorsOf,
  joinEvent,
  playingRoom,
  roomWith,
  T0,
  toasts,
  vip,
} from './test-utils.helper';

describe('join', () => {
  it('first player becomes VIP, later ones do not', () => {
    const room = roomWith(2);
    expect(room.vipId).toBe('p1');
    expect(room.players['p1']?.isVip).toBe(true);
    expect(room.players['p2']?.isVip).toBe(false);
    expect(room.rev).toBe(2);
  });

  it('emits welcome, push and a toast', () => {
    const r = applyRoomEvent(createRoom({ code: 'ABCD', now: T0 }), joinEvent(1), deps);
    expect(effectTypes(r.effects)).toEqual(['welcome', 'toast', 'push']);
    expect(toasts(r.effects)).toEqual(['P1 joined']);
  });

  it('rejects bad names, duplicate names (case-insensitive), bad avatars', () => {
    const room = roomWith(1);
    const bad = applyRoomEvent(room, { ...joinEvent(2), name: '   ' } as never, deps);
    expect(errorsOf(bad.effects)).toEqual(['name_invalid']);
    expect(bad.room).toBe(room);
    const dup = applyRoomEvent(room, joinEvent(2, T0 + 2, 'p1'), deps);
    expect(errorsOf(dup.effects)).toEqual(['name_taken']);
    // I-040: the phone is told who has it; the TVs get a toast about that player.
    const err = dup.effects.find((e) => e.type === 'error');
    expect(err && 'player' in err ? err.player?.name : null).toBe('P1');
    const toast = dup.effects.find((e) => e.type === 'toast');
    expect(toast && 'to' in toast ? toast.to : null).toBe('tvs');
    expect(toast && 'playerId' in toast ? toast.playerId : null).toBe('p1');
    const avatar = applyRoomEvent(room, { ...joinEvent(2), avatarId: 'dragon' } as never, deps);
    expect(errorsOf(avatar.effects)).toEqual(['avatar_invalid']);
    const long = applyRoomEvent(room, joinEvent(2, T0 + 2, 'x'.repeat(17)), deps);
    expect(errorsOf(long.effects)).toEqual(['name_invalid']);
  });

  it('a photo avatar (ADR-037) rides on the player: the snapshot carries it, every avatar id becomes photo:<id>', () => {
    const photo = 'data:image/jpeg;base64,/9j/4AAQ';
    const room = applyRoomEvent(roomWith(1), { ...joinEvent(2), photo } as RoomEvent, deps).room;
    const pub = publicPlayers(room).find((p) => p.id === 'p2');
    expect(pub?.avatarId).toBe('photo:p2');
    expect(pub?.photo).toBe(photo);
    expect(publicPlayers(room).find((p) => p.id === 'p1')?.avatarId).toBe('fox');
    expect(publicPlayers(room).find((p) => p.id === 'p1')?.photo).toBeUndefined();
    const infos = playerInfos(room);
    expect(infos.find((p) => p.id === 'p2')?.avatarId).toBe('photo:p2');
    expect(JSON.stringify(infos)).not.toContain('base64'); // views stay small: the picture is in the snapshot only
  });

  it('enforces capacity and lock', () => {
    let room = createRoom({ code: 'ABCD', now: T0, capacity: 2 });
    room = applyRoomEvent(room, joinEvent(1), deps).room;
    room = applyRoomEvent(room, joinEvent(2), deps).room;
    const full = applyRoomEvent(room, joinEvent(3), deps);
    expect(errorsOf(full.effects)).toEqual(['room_full']);
    const locked = vip(roomWith(1), { action: 'lock' }).room;
    expect(locked.locked).toBe(true);
    const rejected = applyRoomEvent(locked, joinEvent(2), deps);
    expect(errorsOf(rejected.effects)).toEqual(['room_locked']);
    const reopened = vip(locked, { action: 'unlock' }).room;
    expect(applyRoomEvent(reopened, joinEvent(2), deps).room.players['p2']).toBeDefined();
  });

  it('a token resumes the same player even through a lock', () => {
    const locked = vip(roomWith(2), { action: 'lock' }).room;
    const gone = applyRoomEvent(
      locked,
      { type: 'disconnect', now: T0 + 5, playerId: 'p2' },
      deps,
    ).room;
    expect(gone.players['p2']?.connected).toBe(false);
    const back = applyRoomEvent(gone, { ...joinEvent(9), existingToken: 't2' } as never, deps);
    expect(back.room.players['p2']?.connected).toBe(true);
    expect(back.room.players['p9']).toBeUndefined();
    expect(back.effects[0]).toEqual({ type: 'welcome', playerId: 'p2' });
  });

  it('an unknown token falls back to a fresh join', () => {
    const r = applyRoomEvent(
      roomWith(1),
      { ...joinEvent(2), existingToken: 'nope' } as never,
      deps,
    );
    expect(r.room.players['p2']).toBeDefined();
  });

  it('late joiners during a game are spectators and get promoted next game', () => {
    const playing = playingRoom(2);
    const late = applyRoomEvent(playing, joinEvent(3, T0 + 200), deps);
    expect(late.room.players['p3']?.spectator).toBe(true);
    expect(toasts(late.effects)).toEqual(['P3 joined (next game)']);
    expect(playing.game?.state.players['p3']).toBeUndefined();
    const ended = vip(late.room, { action: 'end' }, T0 + 300).room;
    expect(ended.status).toBe('results');
    const again = vip(ended, { action: 'playAgain' }, T0 + 400).room;
    expect(again.status).toBe('playing');
    expect(again.players['p3']?.spectator).toBe(false);
    expect(again.game?.state.players['p3']).toBeDefined();
  });
});

describe('disconnect / leave / expiry', () => {
  it('disconnect keeps the player and tells a running game', () => {
    const playing = playingRoom(2);
    const r = applyRoomEvent(playing, { type: 'disconnect', now: T0 + 200, playerId: 'p2' }, deps);
    expect(r.room.players['p2']?.connected).toBe(false);
    expect(r.room.players['p2']?.disconnectedAt).toBe(T0 + 200);
    expect(r.room.game?.state.players['p2']?.connected).toBe(false);
    const twice = applyRoomEvent(
      r.room,
      { type: 'disconnect', now: T0 + 201, playerId: 'p2' },
      deps,
    );
    expect(twice.effects).toEqual([]);
  });

  it('leave removes immediately and hands the VIP over', () => {
    const r = applyRoomEvent(roomWith(3), { type: 'leave', now: T0 + 50, playerId: 'p1' }, deps);
    expect(r.room.players['p1']).toBeUndefined();
    expect(r.room.vipId).toBe('p2');
    expect(toasts(r.effects)).toEqual(['P2 is now the VIP', 'P1 left']);
    expect(
      applyRoomEvent(r.room, { type: 'leave', now: T0 + 51, playerId: 'zzz' }, deps).effects,
    ).toEqual([]);
  });

  it('VIP handover after 30 s, never back automatically; removal after 120 s', () => {
    // I-347 B: the handover is a game rule — only a game waits on the VIP
    let room: ReturnType<typeof roomWith> = { ...roomWith(3), status: 'playing' };
    room = applyRoomEvent(room, { type: 'disconnect', now: T0 + 10, playerId: 'p1' }, deps).room;
    const early = applyRoomEvent(
      room,
      { type: 'tick', now: T0 + 10 + LIMITS.vipHandoverMs - 1 },
      deps,
    );
    expect(early.room.vipId).toBe('p1');
    const handover = applyRoomEvent(
      room,
      { type: 'tick', now: T0 + 10 + LIMITS.vipHandoverMs },
      deps,
    );
    expect(handover.room.vipId).toBe('p2');
    expect(toasts(handover.effects)).toEqual(['P2 is now the VIP']);
    const back = applyRoomEvent(
      handover.room,
      { ...joinEvent(1), existingToken: 't1', now: T0 + 60_000 } as never,
      deps,
    );
    expect(back.room.vipId).toBe('p2');
    expect(back.room.players['p1']?.isVip).toBe(false);
    // I-746 A: during a game a quiet seat is kept; once the game is over the 120 s grace applies
    room = applyRoomEvent(
      { ...handover.room, status: 'lobby' },
      { type: 'disconnect', now: T0 + 100, playerId: 'p3' },
      deps,
    ).room;
    const expired = applyRoomEvent(
      room,
      { type: 'tick', now: T0 + 100 + LIMITS.disconnectGraceMs },
      deps,
    );
    expect(expired.room.players['p3']).toBeUndefined();
    expect(expired.room.players['p1']).toBeUndefined();
    expect(toasts(expired.effects)).toEqual(['P1 left', 'P3 left']);
  });

  it('handover waits when nobody else is connected', () => {
    let room = roomWith(2);
    room = applyRoomEvent(room, { type: 'disconnect', now: T0 + 10, playerId: 'p2' }, deps).room;
    room = applyRoomEvent(room, { type: 'disconnect', now: T0 + 11, playerId: 'p1' }, deps).room;
    const r = applyRoomEvent(room, { type: 'tick', now: T0 + 50_000 }, deps);
    expect(r.room.vipId).toBe('p1');
    expect(r.effects).toEqual([]);
  });
});
