// Part 00 §1.3–1.4 and ruling 2: the VIP's About on the TV (`highlight`) and a guest's 👍 Suggest.
import { describe, expect, it } from 'vitest';
import { applyRoomEvent } from './room';
import { SUGGEST_TOAST_GAP_MS } from './picker';
import type { RoomState } from './types';
import { T0, deps, errorsOf, roomWith, toasts, vip } from './test-utils.helper';
import { snapshot } from './views';

const onList = (): RoomState => vip(roomWith(3), { action: 'selectGame', gameId: null }).room;
const vote = (room: RoomState, playerId: string, gameId: string | null, now: number) =>
  applyRoomEvent(room, { type: 'vote', now, playerId, gameId }, deps);

describe('highlight: the VIP reads about a game, the TV shows it', () => {
  it('shows the VIP’s open About on the list, and clears when it closes', () => {
    const open = vip(onList(), { action: 'highlight', gameId: 'fake' }).room;
    expect(snapshot(open, deps).highlightedGameId).toBe('fake');
    const closed = vip(open, { action: 'highlight', gameId: null }).room;
    expect(snapshot(closed, deps)).not.toHaveProperty('highlightedGameId');
  });

  it('is the VIP’s alone', () => {
    const result = vip(onList(), { action: 'highlight', gameId: 'fake' }, T0 + 100, 'p2');
    expect(errorsOf(result.effects)).toEqual(['not_vip']);
    expect(snapshot(result.room, deps)).not.toHaveProperty('highlightedGameId');
  });

  it('ignores an unknown game', () => {
    const room = vip(onList(), { action: 'highlight', gameId: 'nope' }).room;
    expect(room.highlight).toBeUndefined();
  });

  it('goes when a game is chosen, when the list reopens, and on a VIP handover', () => {
    const open = vip(onList(), { action: 'highlight', gameId: 'fake' }).room;
    const chosen = vip(open, { action: 'selectGame', gameId: 'fake' }).room;
    expect(chosen.highlight).toBeUndefined();
    expect(snapshot(chosen, deps)).not.toHaveProperty('highlightedGameId');
    const reopened = vip(open, { action: 'selectGame', gameId: null }).room;
    expect(snapshot(reopened, deps)).not.toHaveProperty('highlightedGameId');
    const handed = vip(open, { action: 'transferVip', playerId: 'p2' }).room;
    expect(snapshot(handed, deps)).not.toHaveProperty('highlightedGameId');
  });
});

describe('ruling 2: 👍 Suggest is the vote, heard at most every 10 s', () => {
  it('a vote toasts the room, naming the player', () => {
    const r = vote(onList(), 'p2', 'fake', T0 + 1000);
    expect(toasts(r.effects)).toEqual(['👍 P2 suggests Fake']);
    expect(r.effects.find((e) => e.type === 'toast')).toMatchObject({ playerId: 'p2' });
  });

  it('two votes inside 10 s make one toast; after 10 s another', () => {
    const first = vote(onList(), 'p2', 'fake', T0 + 1000);
    const again = vote(vote(first.room, 'p2', null, T0 + 2000).room, 'p2', 'fake', T0 + 3000);
    expect(toasts(again.effects)).toEqual([]);
    const later = vote(
      vote(again.room, 'p2', null, T0 + 4000).room,
      'p2',
      'fake',
      T0 + 1000 + SUGGEST_TOAST_GAP_MS,
    );
    expect(toasts(later.effects)).toEqual(['👍 P2 suggests Fake']);
  });

  it('taking a vote back says nothing; each player has their own 10 s', () => {
    const first = vote(onList(), 'p2', 'fake', T0 + 1000);
    expect(toasts(vote(first.room, 'p2', null, T0 + 1500).effects)).toEqual([]);
    expect(toasts(vote(first.room, 'p3', 'fake', T0 + 1500).effects)).toEqual([
      '👍 P3 suggests Fake',
    ]);
  });
});
