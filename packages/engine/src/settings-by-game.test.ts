import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { fakeGame } from './fake-game.helper';
import { T0, joinEvent } from './test-utils.helper';
import { createRoom } from './room';
import type { VipAction } from '@partybox/shared';
import type { EngineDeps, RoomState } from './types';

// I-763: two games, so browsing from one to the other and back can be tested
const other = { ...fakeGame, manifest: { ...fakeGame.manifest, id: 'other', name: 'Other' } };
const deps2: EngineDeps = { games: { fake: fakeGame, other } };
const act = (room: RoomState, action: VipAction): RoomState =>
  applyRoomEvent(room, { type: 'vip', now: T0 + 100, playerId: 'p1', action }, deps2).room;

function lobby(): RoomState {
  let room = createRoom({ code: 'ABCD', now: T0 });
  for (let i = 1; i <= 2; i++) room = applyRoomEvent(room, joinEvent(i), deps2).room;
  return room;
}

describe('I-763: settings are kept per game', () => {
  it('browsing to another game and back keeps what the VIP tuned', () => {
    let room = act(lobby(), { action: 'selectGame', gameId: 'fake' });
    expect(room.settings).toMatchObject({ rounds: 3, spicy: false });
    room = act(room, { action: 'updateSettings', settings: { rounds: 5, spicy: true } });
    room = act(room, { action: 'selectGame', gameId: 'other' });
    expect(room.settings).toMatchObject({ rounds: 3, spicy: false }); // the other game: its own defaults
    room = act(room, { action: 'selectGame', gameId: 'fake' });
    expect(room.settings).toMatchObject({ rounds: 5, spicy: true });
  });

  it('re-tapping the selected game keeps its settings', () => {
    let room = act(lobby(), { action: 'selectGame', gameId: 'fake' });
    room = act(room, { action: 'updateSettings', settings: { mode: 'b' } });
    room = act(room, { action: 'selectGame', gameId: 'fake' });
    expect(room.settings['mode']).toBe('b');
  });

  it('a stored value the manifest no longer allows is coerced, a new key gets its default', () => {
    let room = act(lobby(), { action: 'selectGame', gameId: 'fake' });
    room = { ...room, settingsByGame: { fake: { rounds: 99, gone: 1 } } };
    room = act(room, { action: 'selectGame', gameId: 'fake' });
    expect(room.settings['rounds']).toBeLessThanOrEqual(5);
    expect(room.settings['gone']).toBeUndefined();
    expect(room.settings['spicy']).toBe(false);
  });
});
