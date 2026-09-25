// ADR-053 on the screens: the count every surface derives from the server's `countdownAt`, and the
// line above READY (who the room still waits for, never "you": the button says that).
import { describe, expect, it } from 'vitest';
import type { PlayerPublic, RoomSnapshot } from '@partybox/shared';
import { waitingLine } from './controller/StartStage';
import { countAt } from './StageCount';

describe('the 3·2·1', () => {
  it('shows nothing during the breath, then 3, 2, 1 a second each, then nothing', () => {
    expect(countAt(null, 5_000)).toBeNull();
    expect(countAt(1_000, 999)).toBeNull();
    expect(countAt(1_000, 1_000)).toBe(3);
    expect(countAt(1_000, 1_999)).toBe(3);
    expect(countAt(1_000, 2_000)).toBe(2);
    expect(countAt(1_000, 3_500)).toBe(1);
    expect(countAt(1_000, 4_000)).toBeNull();
  });
});

describe('the line above READY', () => {
  const person = (id: string, over: Partial<PlayerPublic> = {}): PlayerPublic => ({
    id,
    name: id.toUpperCase(),
    avatarId: 'fox',
    isVip: id === 'a',
    connected: true,
    spectator: false,
    joinedAt: 0,
    ...over,
  });
  const room = (ready: string[], players: PlayerPublic[], held = false): RoomSnapshot =>
    ({
      status: 'selecting',
      players,
      starting: { gameId: 'g', ready, countdownAt: null, ...(held ? { held: true } : {}) },
    }) as unknown as RoomSnapshot;
  const four = [person('a'), person('b'), person('c'), person('d'), person('bot', { bot: { ownerId: null, strategy: 'random' } })]; // prettier-ignore

  it('names who is still reading, never me and never a bot', () => {
    expect(waitingLine(room([], four), 'a')).toBe('Waiting for B, C and 1 more');
    expect(waitingLine(room(['b'], four), 'a')).toBe('Waiting for C and D');
  });
  it('a dropped phone is not waited for', () => {
    const dropped = four.map((p) => (p.id === 'd' ? { ...p, connected: false } : p));
    expect(waitingLine(room(['b', 'c'], dropped), 'a')).toBe('Everyone else is ready');
    expect(waitingLine(room(['a', 'b', 'c'], dropped), 'a')).toBe('Everyone’s ready!');
  });
  it('says the VIP holds the start after a Wait', () => {
    expect(waitingLine(room(['a', 'b'], four, true), 'b')).toMatch(/^On hold/);
  });
});
