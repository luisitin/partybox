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
  it('keeps the rest of the results as the game made them', () => {
    const ended = applyRoomEvent(
      playingRoom(2),
      { type: 'vip', now: T0 + 300, playerId: 'p1', action: { action: 'end' } },
      deps,
    ).room;
    expect(ended.results?.gameId).toBe('fake');
  });
});
