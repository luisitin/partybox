// ADR-047 (Part 00 §3): the VIP's "Where is everyone?", each phone's "I can see the TV", what a
// game learns at start, and which phones get the stage.
import { describe, expect, it } from 'vitest';
import type { InitContext } from '@partybox/shared';
import { fakeGame } from './fake-game.helper';
import { applyRoomEvent } from './room';
import type { EngineDeps, RoomState } from './types';
import { T0, deps, errorsOf, joinEvent, playingRoom, roomWith, toasts, vip } from './test-utils.helper'; // prettier-ignore
import { controllerView, snapshot } from './views';

const presence = (room: RoomState, playerId: string, canSeeTv: boolean): RoomState =>
  applyRoomEvent(room, { type: 'presence', now: T0 + 50, playerId, canSeeTv }, deps).room;

describe('the room switch', () => {
  it('switches, tells the room, and reads as together when unset', () => {
    const room = roomWith(3);
    expect(snapshot(room, deps)).not.toHaveProperty('presenceMode');
    const result = vip(room, { action: 'setPresenceMode', mode: 'remote-text' });
    expect(snapshot(result.room, deps).presenceMode).toBe('remote-text');
    // told on the TV and the VIP's phone, not over every guest's screen (S2)
    expect(toasts(result.effects)).toEqual(
      Array(2).fill('💬 Some of you are remote, with no call'),
    );
    const back = vip(result.room, { action: 'setPresenceMode', mode: 'together' }).room;
    expect(back.presenceMode).toBeUndefined();
  });

  it('is the VIP’s, and never mid-game', () => {
    expect(errorsOf(vip(roomWith(3), { action: 'setPresenceMode', mode: 'remote-voice' }, T0 + 100, 'p2').effects)).toEqual(['not_vip']); // prettier-ignore
    const playing = vip(playingRoom(), { action: 'setPresenceMode', mode: 'remote-voice' });
    expect(errorsOf(playing.effects)).toEqual(['cannot_start']);
    expect(playing.room.presenceMode).toBeUndefined();
  });
});

describe('each phone', () => {
  it('joins with the value the host decided and flips it later; bots always see the TV', () => {
    let room = roomWith(1);
    room = applyRoomEvent(room, { ...joinEvent(2), canSeeTv: false } as never, deps).room;
    expect(snapshot(room, deps).players.find((p) => p.id === 'p2')).toMatchObject({ canSeeTv: false }); // prettier-ignore
    room = presence(room, 'p2', true);
    expect(snapshot(room, deps).players.find((p) => p.id === 'p2')).not.toHaveProperty('canSeeTv');
    const withBot = applyRoomEvent(room, { type: 'bot-add', now: T0 + 60, ownerId: null, playerId: 'b1', token: 'tb', strategy: 'idle' }, deps).room; // prettier-ignore
    expect(presence(withBot, 'b1', false).players['b1']?.canSeeTv).toBeUndefined();
  });

  it('a phone that comes back from another network brings its new value', () => {
    let room = roomWith(2);
    room = applyRoomEvent(room, { type: 'disconnect', now: T0 + 20, playerId: 'p2' }, deps).room;
    const back = { ...joinEvent(2, T0 + 30), existingToken: 't2', canSeeTv: false };
    room = applyRoomEvent(room, back as never, deps).room;
    expect(room.players['p2']?.canSeeTv).toBe(false);
  });
});

describe('what the game sees', () => {
  const seen: InitContext[] = [];
  const spy = { ...fakeGame, manifest: { ...fakeGame.manifest, id: 'spy' }, init: (ctx: InitContext) => (seen.push(ctx), fakeGame.init(ctx)) }; // prettier-ignore
  const spyDeps: EngineDeps = { games: { fake: fakeGame, spy } };
  const start = (room: RoomState): RoomState => {
    const chosen = applyRoomEvent(room, { type: 'vip', now: T0 + 100, playerId: 'p1', action: { action: 'selectGame', gameId: 'spy' } }, spyDeps).room; // prettier-ignore
    return applyRoomEvent(chosen, { type: 'vip', now: T0 + 101, playerId: 'p1', action: { action: 'startNow' }, seed: 7 }, spyDeps).room; // prettier-ignore
  };

  it('gets the room’s presence and each player’s view of the TV at start', () => {
    seen.length = 0;
    let room = vip(roomWith(3), { action: 'setPresenceMode', mode: 'remote-voice' }).room;
    room = presence(room, 'p3', false);
    start(room);
    expect(seen[0]?.presence).toEqual({ mode: 'remote-voice', phoneOnly: false });
    expect(seen[0]?.players.map((p) => [p.id, p.canSeeTv])).toEqual([['p1', true], ['p2', true], ['p3', false]]); // prettier-ignore
  });

  it('stamps the stage per phone, live: a mid-game flip moves only that phone', () => {
    let room = start(presence(roomWith(3), 'p3', false));
    const stage = (r: RoomState, id: string) => controllerView(r, id, spyDeps)?.phoneOnly;
    expect([stage(room, 'p1'), stage(room, 'p2'), stage(room, 'p3')]).toEqual([false, false, true]);
    const gameBefore = room.game?.state;
    room = presence(room, 'p2', false);
    expect([stage(room, 'p1'), stage(room, 'p2'), stage(room, 'p3')]).toEqual([false, true, true]);
    expect(room.game?.state).toBe(gameBefore);
  });

  it('a phone-only room puts the stage on every phone', () => {
    const room = start(vip(roomWith(3), { action: 'setPhoneOnly', on: true }).room);
    expect(['p1', 'p2', 'p3'].map((id) => controllerView(room, id, spyDeps)?.phoneOnly)).toEqual([true, true, true]); // prettier-ignore
  });
});
