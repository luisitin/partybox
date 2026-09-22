// I-134 B (preview branch): a game that deals in rounds hears who is waiting.
import { describe, expect, it } from 'vitest';
import type { GameDefinition, GameEvent } from '@partybox/shared';
import { fakeGame } from './fake-game.helper';
import type { FakeInput, FakeState } from './fake-game.helper';
import { applyRoomEvent } from './room';
import { T0, joinEvent, playingRoom, toasts } from './test-utils.helper';

// The fake game, opted in; it takes a joiner at once (a real one waits for its next deal).
const roundsGame: GameDefinition<FakeState, FakeInput> = {
  ...fakeGame,
  manifest: { ...fakeGame.manifest, lateJoin: 'round' },
  reduce(state: FakeState, event: GameEvent<FakeInput>): FakeState {
    if (event.type === 'player' && event.joining && !state.players[event.playerId])
      return {
        ...state,
        players: {
          ...state.players,
          [event.playerId]: { id: event.playerId, ...event.joining, connected: event.connected },
        },
      };
    return fakeGame.reduce(state, event);
  },
};

describe('I-134 B late join', () => {
  it('tells an opted-in game who is waiting; once it has them they are a player', () => {
    const r = applyRoomEvent(playingRoom(3), joinEvent(9, T0 + 500, 'Lou'), {
      games: { fake: roundsGame },
    });
    expect(r.room.game?.state.players['p9']?.name).toBe('Lou');
    expect(r.room.players['p9']?.spectator).toBe(false);
    expect(toasts(r.effects)).toContain('Lou joined (next round)');
  });

  it('a game that has not opted in hears nothing: the spectator waits for the next game', () => {
    const r = applyRoomEvent(playingRoom(3), joinEvent(9, T0 + 500, 'Lou'), {
      games: { fake: fakeGame },
    });
    expect(r.room.game?.state.players['p9']).toBeUndefined();
    expect(r.room.players['p9']?.spectator).toBe(true);
    expect(toasts(r.effects)).toContain('Lou joined (next game)');
  });
});
