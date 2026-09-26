// I-247: the wager phone knows where I stand.
import { describe, expect, it } from 'vitest';
import { standingOf } from '../server/views';
import type { State } from '../server/types';

const state = (scores: Record<string, number>): State =>
  ({
    players: Object.fromEntries(Object.keys(scores).map((id) => [id, { id, name: id.toUpperCase(), avatarId: 'fox', connected: true }])),
    scores,
  }) as unknown as State;

describe('I-247: where I stand at the wager', () => {
  it('second: the leader and my chaser', () => {
    const s = state({ priya: 2022, sam: 1682, bot: 1472 });
    expect(standingOf(s, 'sam')).toMatchObject({ rank: 2, count: 3, leader: { name: 'PRIYA', gap: 340 }, chaser: { name: 'BOT', gap: 210 } });
    expect(standingOf(s, 'priya')?.leader).toBeNull();
  });
});
