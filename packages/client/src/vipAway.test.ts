// I-663: who takes over when the VIP's phone is gone.
import { describe, expect, it } from 'vitest';
import type { RoomSnapshot } from '@partybox/shared';
import { nextVip } from './vipAway';

const room = {
  vip: 'sam',
  players: [
    { id: 'sam', name: 'Sam', connected: false, joinedAt: 1, spectator: false },
    { id: 'bot', name: 'Bot 1', connected: true, joinedAt: 2, spectator: false, bot: { ownerId: null, strategy: 'random' } },
    { id: 'lee', name: 'Lee', connected: true, joinedAt: 4, spectator: false },
    { id: 'priya', name: 'Priya', connected: true, joinedAt: 3, spectator: false },
  ],
} as unknown as RoomSnapshot;

describe('I-663: nextVip', () => {
  it('the longest-joined connected person, never a bot', () => {
    expect(nextVip(room)).toEqual({ id: 'priya', name: 'Priya' });
  });
});
