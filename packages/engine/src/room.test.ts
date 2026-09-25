import { describe, expect, it } from 'vitest';
import { applyRoomEvent, createRoom } from './room';
import {
  deps,
  effectTypes,
  errorsOf,
  joinEvent,
  playingRoom,
  roomWith,
  T0,
} from './test-utils.helper';

describe('room', () => {
  it('createRoom starts empty in the lobby with rev 0', () => {
    const room = createRoom({ code: 'ABCD', now: T0 });
    expect(room).toMatchObject({
      code: 'ABCD',
      status: 'lobby',
      rev: 0,
      players: {},
      vipId: null,
      capacity: 16,
    });
  });

  it('rev increases exactly once per event that pushes, and pushes are collapsed to one', () => {
    const room = roomWith(1);
    const r = applyRoomEvent(room, { type: 'leave', now: T0 + 5, playerId: 'p1' }, deps);
    expect(r.effects.filter((e) => e.type === 'push')).toHaveLength(1);
    expect(r.effects.at(-1)?.type).toBe('push');
    expect(r.room.rev).toBe(room.rev + 1);
    const noop = applyRoomEvent(r.room, { type: 'tick', now: T0 + 6 }, deps);
    expect(noop.room.rev).toBe(r.room.rev);
    expect(noop.effects).toEqual([]);
  });

  it('input: validated, only from playing players, only while playing', () => {
    const lobby = roomWith(2);
    expect(
      errorsOf(
        applyRoomEvent(
          lobby,
          { type: 'input', now: T0, playerId: 'p1', input: { type: 'tap' } },
          deps,
        ).effects,
      ),
    ).toEqual(['not_playing']);
    expect(
      errorsOf(
        applyRoomEvent(lobby, { type: 'input', now: T0, playerId: 'zz', input: {} }, deps).effects,
      ),
    ).toEqual(['not_in_room']);
    const playing = playingRoom(2);
    expect(
      errorsOf(
        applyRoomEvent(
          playing,
          { type: 'input', now: T0, playerId: 'p1', input: { type: 'nope' } },
          deps,
        ).effects,
      ),
    ).toEqual(['invalid_input']);
    const ok = applyRoomEvent(
      playing,
      { type: 'input', now: T0 + 200, playerId: 'p1', input: { type: 'tap' } },
      deps,
    );
    expect(ok.room.game?.state).toMatchObject({ taps: { p1: 1, p2: 0 } });
    expect(effectTypes(ok.effects)).toEqual(['push']);
    const withSpectator = applyRoomEvent(playing, joinEvent(3, T0 + 300), deps).room;
    expect(
      errorsOf(
        applyRoomEvent(
          withSpectator,
          { type: 'input', now: T0 + 301, playerId: 'p3', input: { type: 'tap' } },
          deps,
        ).effects,
      ),
    ).toEqual(['not_playing']);
  });

  it('input for a game that vanished from the registry is ignored', () => {
    const playing = playingRoom(2);
    const r = applyRoomEvent(
      playing,
      { type: 'input', now: T0, playerId: 'p1', input: { type: 'tap' } },
      { games: {} },
    );
    expect(r.effects).toEqual([]);
  });

  it('dev:loadState replaces the running game; bad payloads are logged', () => {
    const playing = playingRoom(2);
    const state = { ...playing.game!.state, taps: { p1: 5, p2: 0 } };
    const loaded = applyRoomEvent(
      roomWith(2),
      { type: 'dev:loadState', now: T0 + 9, gameId: 'fake', state },
      deps,
    );
    expect(loaded.room.status).toBe('playing');
    expect(loaded.room.game?.state).toMatchObject({ taps: { p1: 5 } });
    expect(
      effectTypes(
        applyRoomEvent(
          roomWith(2),
          { type: 'dev:loadState', now: T0, gameId: 'fake', state: 42 },
          deps,
        ).effects,
      ),
    ).toEqual(['log']);
    expect(
      effectTypes(
        applyRoomEvent(roomWith(2), { type: 'dev:loadState', now: T0, gameId: 'zz', state }, deps)
          .effects,
      ),
    ).toEqual(['log']);
  });

  it('dev:gameEvent injects raw events after a shape check', () => {
    const playing = playingRoom(2);
    const r = applyRoomEvent(
      playing,
      { type: 'dev:gameEvent', now: T0, event: { type: 'vip', now: T0 + 1, action: 'skip' } },
      deps,
    );
    expect(r.room.status).toBe('results');
    expect(
      effectTypes(
        applyRoomEvent(playing, { type: 'dev:gameEvent', now: T0, event: { nope: 1 } }, deps)
          .effects,
      ),
    ).toEqual(['log']);
  });

  it('a tick fires chained due deadlines but stops after a bounded number', () => {
    // A game whose every phase has a deadline in the past: each timer enters a new instance.
    let n = 0;
    const eager = {
      games: {
        fake: {
          ...deps.games['fake']!,
          reduce: (
            s: { phase: { id: string; startedAt: number; deadline: number | null } },
            e: { type: string; now: number },
          ) =>
            e.type === 'timer'
              ? {
                  ...s,
                  phase: { id: 'play', startedAt: s.phase.startedAt + 1, deadline: e.now - 1 },
                }
              : s,
          results: () =>
            ++n > 100 ? { scores: {}, ranking: [], winnerIds: [], awards: [] } : null,
        },
      },
    };
    const room = playingRoom(2);
    const r = applyRoomEvent(
      room,
      { type: 'tick', now: room.game!.state.phase.deadline! },
      eager as never,
    );
    expect(r.room.status).toBe('playing');
    expect(r.room.game!.state.phase.startedAt).toBe(room.game!.state.phase.startedAt + 10);
  });

  it('dev:results puts a results screen on the room as given; a bad shape is refused', () => {
    const room = roomWith(2);
    const results = {
      gameId: 'fake',
      players: [],
      results: { scores: {}, ranking: [], winnerIds: [], awards: [] },
    };
    const shown = applyRoomEvent(room, { type: 'dev:results', now: T0, results }, deps).room;
    expect(shown.status).toBe('results');
    expect(shown.results).toEqual(results);
    const bad = applyRoomEvent(room, { type: 'dev:results', now: T0, results: { gameId: 'fake' } }, deps); // prettier-ignore
    expect(bad.room).toBe(room);
  });
});
