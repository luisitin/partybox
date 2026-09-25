// I-650: votes for the next game.
import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { deps, playingRoom, roomWith, T0, vip } from './test-utils.helper';
import { snapshot } from './views';
import type { RoomState } from './types';

const vote = (room: RoomState, playerId: string, gameId: string | null): RoomState =>
  applyRoomEvent(room, { type: 'vote', now: T0 + 50, playerId, gameId }, deps).room;

describe('I-650: voting for the next game', () => {
  it('a person votes, changes it, and takes it back', () => {
    let room = vote(roomWith(3), 'p2', 'fake');
    expect(snapshot(room, deps).votes).toEqual({ p2: 'fake' });
    room = vote(room, 'p3', 'fake');
    expect(snapshot(room, deps).votes).toEqual({ p2: 'fake', p3: 'fake' });
    room = vote(room, 'p2', null);
    expect(snapshot(room, deps).votes).toEqual({ p3: 'fake' });
  });

  it('an unknown game, a stranger, and a vote during a game are ignored', () => {
    const lobby = roomWith(2);
    expect(vote(lobby, 'p1', 'nope')).toBe(lobby);
    expect(vote(lobby, 'zz', 'fake')).toBe(lobby);
    const playing = playingRoom(2);
    expect(vote(playing, 'p1', 'fake')).toBe(playing);
  });

  it('a bot never votes', () => {
    const lobby = roomWith(2);
    const withBot: RoomState = {
      ...lobby,
      players: {
        ...lobby.players,
        p2: { ...lobby.players.p2!, bot: { ownerId: 'p1', strategy: 'random' } },
      },
    };
    expect(vote(withBot, 'p2', 'fake')).toBe(withBot);
  });

  it('starting a game clears the votes; a vote leaves with its voter', () => {
    let room = vote(vote(roomWith(3), 'p2', 'fake'), 'p3', 'fake');
    room = applyRoomEvent(room, { type: 'leave', now: T0 + 60, playerId: 'p3' }, deps).room;
    expect(snapshot(room, deps).votes).toEqual({ p2: 'fake' });
    const selected = vip(room, { action: 'selectGame', gameId: 'fake' }, T0 + 70).room;
    const started = vip(selected, { action: 'startNow' }, T0 + 71, 'p1', 42).room;
    expect(started.status).toBe('playing');
    expect(snapshot(started, deps).votes).toEqual({});
  });
});
