// I-652 B: the room remembers tonight's games and their human winners.
import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { NIGHT_GAP_MS } from './runner';
import { deps, playingRoom, T0 } from './test-utils.helper';
import type { RoomState } from './types';

/** Plays the fake game to its end at `at`; `tapper` (if any) scores one point first. */
function play(room: RoomState, at: number, tapper?: string): RoomState {
  let r = room;
  if (tapper)
    r = applyRoomEvent(r, { type: 'input', now: at, playerId: tapper, input: { type: 'tap' } }, deps).room;
  return applyRoomEvent(r, { type: 'tick', now: at + 1_000_000 }, deps).room;
}

describe('I-652: tonight', () => {
  it('each finished game is added with its winner; a scoreless one has no winner', () => {
    const first = play(playingRoom(2), T0 + 200, 'p1');
    expect(first.status).toBe('results');
    expect(first.tonight).toEqual([
      expect.objectContaining({ gameId: 'fake', winners: [expect.objectContaining({ name: 'P1' })], botsWon: false }),
    ]);
    const second = play({ ...playingRoom(2), tonight: first.tonight }, T0 + 300);
    expect(second.tonight?.length).toBe(2);
    expect(second.tonight?.[1]).toMatchObject({ winners: [], botsWon: false });
  });

  it('a win by a bot is kept as bots won, never as a person', () => {
    const room = playingRoom(2);
    const withBot: RoomState = {
      ...room,
      game: {
        ...room.game!,
        state: {
          ...room.game!.state,
          players: { ...room.game!.state.players, p1: { ...room.game!.state.players.p1!, bot: true } },
        },
      },
    };
    const done = play(withBot, T0 + 200, 'p1');
    expect(done.tonight?.[0]).toMatchObject({ winners: [], botsWon: true });
  });

  it('a gap of more than 3 hours starts a new night; at most 6 games are kept', () => {
    let tonight: RoomState['tonight'] = [];
    for (let i = 0; i < 8; i++) tonight = play({ ...playingRoom(2), tonight }, T0 + 200 + i).tonight;
    expect(tonight?.length).toBe(6);
    const later = play({ ...playingRoom(2), tonight }, T0 + NIGHT_GAP_MS * 2);
    expect(later.tonight?.length).toBe(1);
  });
});
