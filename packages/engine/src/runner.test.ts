import { describe, expect, it } from 'vitest';
import { LIMITS } from '@partybox/shared';
import { PLAY_MS } from './fake-game.helper';
import { applyRoomEvent } from './room';
import { nextWakeAt, playerInfos } from './runner';
import { deps, effectTypes, playingRoom, roomWith, T0, vip } from './test-utils.helper';

describe('runner', () => {
  it('start seeds the game with every room player in join order', () => {
    const room = playingRoom(3);
    expect(room.status).toBe('playing');
    expect(playerInfos(room).map((p) => p.id)).toEqual(['p1', 'p2', 'p3']);
    expect(Object.keys(room.game!.state.players)).toEqual(['p1', 'p2', 'p3']);
    expect(room.game!.state.phase).toEqual({
      id: 'play',
      startedAt: T0 + 101,
      deadline: T0 + 101 + PLAY_MS,
    });
    expect(room.lastGame).toEqual({
      gameId: 'fake',
      settings: { rounds: 3, spicy: false, mode: 'a' },
    });
  });

  it('a throwing reducer leaves state untouched and logs', () => {
    const room = playingRoom(2);
    const r = applyRoomEvent(
      room,
      { type: 'input', now: T0 + 200, playerId: 'p1', input: { type: 'boom' } },
      deps,
    );
    expect(r.room.game?.state).toBe(room.game?.state);
    expect(effectTypes(r.effects)).toEqual(['log']);
    expect(r.room.rev).toBe(room.rev);
  });

  it('a throwing init leaves the room in selecting', () => {
    const broken = {
      games: {
        fake: {
          ...deps.games['fake']!,
          init: () => {
            throw new Error('nope');
          },
        },
      },
    };
    const selecting = vip(roomWith(2), { action: 'selectGame', gameId: 'fake' }).room;
    const r = applyRoomEvent(
      selecting,
      { type: 'vip', now: T0 + 5, playerId: 'p1', action: { action: 'start' } },
      broken,
    );
    expect(r.room.status).toBe('selecting');
    expect(effectTypes(r.effects)).toEqual(['log']);
  });

  it('a throwing results() is logged and the game continues', () => {
    const broken = {
      games: {
        fake: {
          ...deps.games['fake']!,
          results: () => {
            throw new Error('r');
          },
        },
      },
    };
    const room = playingRoom(2);
    const r = applyRoomEvent(
      room,
      { type: 'input', now: T0 + 200, playerId: 'p1', input: { type: 'tap' } },
      broken,
    );
    expect(r.room.status).toBe('playing');
    expect(effectTypes(r.effects)).toEqual(['log', 'push']);
  });

  it('fires the timer exactly once per phase instance, at the deadline', () => {
    const room = playingRoom(2);
    const deadline = room.game!.state.phase.deadline!;
    expect(nextWakeAt(room)).toBe(deadline);
    const early = applyRoomEvent(room, { type: 'tick', now: deadline - 1 }, deps);
    expect(early.room).toBe(room);
    expect(early.effects).toEqual([]);
    const due = applyRoomEvent(room, { type: 'tick', now: deadline }, deps);
    expect(due.room.status).toBe('results');
    expect(due.room.results?.results.scores).toEqual({ p1: 0, p2: 0 });
  });

  it('a stale deadline is not re-fired when the game ignores the timer', () => {
    const ignoring = { games: { fake: { ...deps.games['fake']!, reduce: (s: never) => s } } };
    const room = playingRoom(2);
    const deadline = room.game!.state.phase.deadline!;
    const once = applyRoomEvent(room, { type: 'tick', now: deadline }, ignoring);
    expect(once.room.game?.firedTimer).toEqual({ phaseId: 'play', startedAt: T0 + 101 });
    expect(nextWakeAt(once.room)).toBeNull();
    const twice = applyRoomEvent(once.room, { type: 'tick', now: deadline + 5000 }, ignoring);
    expect(twice.room).toBe(once.room);
  });

  it('a timer that re-arms a later deadline in its own phase fires again (ADR-033)', () => {
    // A reducer that takes two beats in one phase: the first tick moves the deadline 2 s on.
    const game = deps.games['fake']!;
    const beats = {
      games: {
        fake: {
          ...game,
          reduce: (s: ReturnType<typeof game.init>, e: Parameters<typeof game.reduce>[1]) =>
            e.type === 'timer' && s.phase.deadline === T0 + 101 + PLAY_MS // the first beat only
              ? { ...s, phase: { ...s.phase, deadline: s.phase.deadline + 2000 } }
              : game.reduce(s, e),
        },
      },
    };
    const room = playingRoom(2);
    const deadline = room.game!.state.phase.deadline!;
    const once = applyRoomEvent(room, { type: 'tick', now: deadline }, beats);
    expect(once.room.status).toBe('playing');
    expect(once.room.game?.firedTimer).toBeNull();
    expect(nextWakeAt(once.room)).toBe(deadline + 2000);
    // Not due yet: nothing; due: the second beat ends the phase as the timer normally would.
    expect(applyRoomEvent(once.room, { type: 'tick', now: deadline + 1999 }, beats).room).toBe(
      once.room,
    );
    const twice = applyRoomEvent(once.room, { type: 'tick', now: deadline + 2000 }, beats);
    expect(twice.room.status).toBe('results');
  });

  it('pause stops the clock and the wake; resume shifts the deadline', () => {
    const room = playingRoom(2);
    const deadline = room.game!.state.phase.deadline!;
    const paused = vip(room, { action: 'pause' }, T0 + 500).room;
    expect(nextWakeAt(paused)).toBeNull();
    const stillPaused = applyRoomEvent(paused, { type: 'tick', now: deadline + 1 }, deps);
    expect(stillPaused.room.status).toBe('playing');
    const resumed = vip(paused, { action: 'resume' }, T0 + 2500).room;
    expect(nextWakeAt(resumed)).toBe(deadline + 2000);
  });

  it('nextWakeAt includes disconnect grace and VIP handover', () => {
    // I-347 B: the VIP handover is scheduled only during a game; in the lobby only the grace is
    const room = applyRoomEvent(
      { ...roomWith(2), status: 'playing' },
      { type: 'disconnect', now: T0 + 10, playerId: 'p1' },
      deps,
    ).room;
    expect(nextWakeAt(room)).toBe(T0 + 10 + LIMITS.vipHandoverMs);
    const inLobby = applyRoomEvent(roomWith(2), { type: 'disconnect', now: T0 + 10, playerId: 'p1' }, deps).room;
    expect(nextWakeAt(inLobby)).toBe(T0 + 10 + LIMITS.disconnectGraceMs);
    const other = applyRoomEvent(
      roomWith(2),
      { type: 'disconnect', now: T0 + 10, playerId: 'p2' },
      deps,
    ).room;
    expect(nextWakeAt(other)).toBe(T0 + 10 + LIMITS.disconnectGraceMs);
    expect(nextWakeAt(roomWith(2))).toBeNull();
  });

  it('inputs count and results include every player from init', () => {
    let room = playingRoom(3);
    room = applyRoomEvent(
      room,
      { type: 'input', now: T0 + 200, playerId: 'p2', input: { type: 'tap' } },
      deps,
    ).room;
    room = applyRoomEvent(room, { type: 'leave', now: T0 + 300, playerId: 'p3' }, deps).room;
    const ended = vip(room, { action: 'end' }, T0 + 400).room;
    expect(ended.results?.results.scores).toEqual({ p1: 0, p2: 1, p3: 0 });
    expect(ended.results?.players.map((p) => p.id)).toEqual(['p1', 'p2', 'p3']);
    expect(ended.results?.results.winnerIds).toEqual(['p2']);
  });
});
