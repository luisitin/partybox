import { describe, expect, it } from 'vitest';
import { LIMITS } from '@partybox/shared';
import { applyRoomEvent } from './room';
import {
  deps,
  errorsOf,
  joinEvent,
  playingRoom,
  roomWith,
  T0,
  toasts,
  vip,
} from './test-utils.helper';
import type { ApplyResult, RoomState } from './types';

function addBot(room: RoomState, ownerId: string | null, n: number, now = T0 + 50): ApplyResult {
  return applyRoomEvent(
    room,
    { type: 'bot-add', now, ownerId, playerId: `bot${n}`, token: `tb${n}`, strategy: 'random' },
    deps,
  );
}

function removeBot(room: RoomState, ownerId: string | null, botId: string): ApplyResult {
  return applyRoomEvent(room, { type: 'bot-remove', now: T0 + 60, ownerId, botId }, deps);
}

describe('bots', () => {
  it('a player adds owned bots with unique names; bots are never VIP', () => {
    const r1 = addBot(roomWith(2), 'p2', 1);
    expect(r1.room.players['bot1']).toMatchObject({
      name: "P2's bot",
      avatarId: 'robot',
      isVip: false,
      bot: { ownerId: 'p2', strategy: 'random' },
    });
    expect(toasts(r1.effects)).toEqual(["P2's bot joined"]);
    const r2 = addBot(r1.room, 'p2', 2);
    expect(r2.room.players['bot2']?.name).toBe("P2's bot 2");
    const left = applyRoomEvent(r2.room, { type: 'leave', now: T0 + 60, playerId: 'p1' }, deps);
    expect(left.room.vipId).toBe('p2'); // never a bot
  });

  it('enforces the per-owner limit, membership and bots-adding-bots', () => {
    let room = roomWith(1);
    for (let i = 1; i <= LIMITS.roomCapacity; i++) room = addBot(room, 'p1', i).room;
    expect(Object.keys(room.players).length).toBe(5); // owner + 4 bots
    expect(errorsOf(addBot(room, 'p1', 99).effects)).toEqual(['bot_limit']);
    expect(errorsOf(addBot(roomWith(1), 'ghost', 7).effects)).toEqual(['not_in_room']);
    const withBot = addBot(roomWith(1), 'p1', 1).room;
    expect(errorsOf(addBot(withBot, 'bot1', 2).effects)).toEqual(['bot_limit']);
  });

  it('dev bots are ownerless, named Bot 1, Bot 2, …', () => {
    const r = addBot(roomWith(1), null, 1);
    expect(r.room.players['bot1']).toMatchObject({ name: 'Bot 1', bot: { ownerId: null } });
    expect(addBot(r.room, null, 2).room.players['bot2']?.name).toBe('Bot 2');
  });

  it('owner, VIP or the system can remove a bot; others cannot; removal is idempotent', () => {
    const room = addBot(roomWith(3), 'p3', 1).room;
    expect(errorsOf(removeBot(room, 'p2', 'bot1').effects)).toEqual(['not_vip']);
    expect(removeBot(room, 'p3', 'bot1').room.players['bot1']).toBeUndefined();
    expect(removeBot(room, 'p1', 'bot1').room.players['bot1']).toBeUndefined();
    expect(removeBot(room, null, 'bot1').room.players['bot1']).toBeUndefined();
    const gone = removeBot(room, 'p3', 'bot1').room;
    expect(errorsOf(removeBot(gone, 'p3', 'bot1').effects)).toEqual(['not_in_room']);
    expect(errorsOf(removeBot(room, 'p1', 'p2').effects)).toEqual(['not_in_room']);
    expect(errorsOf(removeBot(room, 'ghost', 'bot1').effects)).toEqual(['not_in_room']);
  });

  it('a bot leaves with its owner (leave, kick, or 120 s expiry)', () => {
    const room = addBot(addBot(roomWith(2), 'p2', 1).room, 'p2', 2).room;
    const left = applyRoomEvent(room, { type: 'leave', now: T0 + 10, playerId: 'p2' }, deps);
    expect(Object.keys(left.room.players)).toEqual(['p1']);
    const kicked = vip(room, { action: 'kick', playerId: 'p2' }).room;
    expect(Object.keys(kicked.players)).toEqual(['p1']);
    const gone = applyRoomEvent(room, { type: 'disconnect', now: T0 + 10, playerId: 'p2' }, deps);
    const expired = applyRoomEvent(
      gone.room,
      { type: 'tick', now: T0 + 10 + LIMITS.disconnectGraceMs },
      deps,
    );
    expect(Object.keys(expired.room.players)).toEqual(['p1']);
  });

  it('blocks starting a game without supportsBots while bots are in the room', () => {
    const fake = deps.games['fake']!;
    const noBots = {
      games: { fake: { ...fake, manifest: { ...fake.manifest, supportsBots: false } } },
    };
    const yesBots = {
      games: { fake: { ...fake, manifest: { ...fake.manifest, supportsBots: true } } },
    };
    const room = addBot(roomWith(2), 'p2', 1).room;
    const select = {
      type: 'vip',
      now: T0,
      playerId: 'p1',
      action: { action: 'selectGame', gameId: 'fake' },
    } as const;
    const start = { type: 'vip', now: T0, playerId: 'p1', action: { action: 'start' } } as const;
    const selected = applyRoomEvent(room, select, noBots).room;
    const blocked = applyRoomEvent(selected, start, noBots);
    expect(blocked.room.status).toBe('selecting');
    expect(blocked.effects.find((e) => e.type === 'error')).toMatchObject({
      code: 'cannot_start',
      message: expect.stringContaining('no bot support'),
    });
    const ok = applyRoomEvent(selected, start, yesBots);
    expect(ok.room.status).toBe('playing');
    expect(ok.room.game?.state.players['bot1']).toBeDefined();
  });

  it('a bot added mid-game is a spectator until the next game', () => {
    const r = addBot(playingRoom(2), 'p2', 1, T0 + 500);
    expect(r.room.players['bot1']?.spectator).toBe(true);
    expect(toasts(r.effects)).toEqual(["P2's bot joined (next game)"]);
  });
});

describe('resume by name', () => {
  it('a token-less join under a disconnected player name resumes that player', () => {
    const gone = applyRoomEvent(
      roomWith(2),
      { type: 'disconnect', now: T0 + 5, playerId: 'p2' },
      deps,
    ).room;
    const back = applyRoomEvent(gone, joinEvent(9, T0 + 10, 'p2'), deps);
    expect(back.room.players['p9']).toBeUndefined();
    expect(back.room.players['p2']?.connected).toBe(true);
    expect(back.effects[0]).toEqual({ type: 'welcome', playerId: 'p2' });
    // Connected players keep their name protected.
    expect(
      errorsOf(applyRoomEvent(roomWith(2), joinEvent(9, T0 + 10, 'P1'), deps).effects),
    ).toEqual(['name_taken']);
  });
});
