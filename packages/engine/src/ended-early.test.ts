// I-546: a game the VIP ends is marked on its results; a finish or a skip is not.
import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { deps, playingRoom, T0, vip } from './test-utils.helper';

describe('I-546: endedEarly', () => {
  it('the VIP ending a game marks the results with their name', () => {
    const playing = playingRoom(2);
    const ended = vip(playing, { action: 'end' }, T0 + 300).room;
    expect(ended.status).toBe('results');
    expect(ended.results?.endedEarly?.by).toBe(playing.players['p1']?.name);
  });
  it('a skip to the end is a finish, not an early end', () => {
    const skipped = vip(playingRoom(2), { action: 'skip' }, T0 + 300).room;
    expect(skipped.status).toBe('results');
    expect(skipped.results?.endedEarly).toBeUndefined();
  });
  it('B: the game says where it stopped', () => {
    const counted = {
      games: {
        fake: { ...deps.games['fake']!, progress: () => ({ at: 2, total: 6, unit: 'question' as const }) },
      },
    };
    const ended = applyRoomEvent(
      playingRoom(2),
      { type: 'vip', now: T0 + 300, playerId: 'p1', action: { action: 'end' } },
      counted,
    ).room;
    expect(ended.results?.endedEarly?.progress).toEqual({ at: 2, total: 6, unit: 'question' });
    expect(vip(playingRoom(2), { action: 'end' }, T0 + 300).room.results?.endedEarly?.progress).toBeNull();
  });
});
