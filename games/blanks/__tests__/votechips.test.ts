// I-144 C (preview branch): the TV learns the votes only once they are all in.
import { describe, expect, it } from 'vitest';
import { playAll, readAll, start, toAnswer, tv, vote } from './helpers';

describe('I-144 C vote letters', () => {
  it('are null while anyone can still vote, and every vote on the closing beat', () => {
    let s = readAll(playAll(toAnswer(start({ players: 3 }))));
    expect(s.phase.id).toBe('judge');
    const ids = Object.keys(s.players).sort();
    const slotFor = (id: string): number => s.slots.findIndex((x) => x !== id);
    s = vote(s, ids[0] as string, slotFor(ids[0] as string));
    expect(tv(s).voteLetters).toBeNull();
    s = vote(s, ids[1] as string, slotFor(ids[1] as string));
    expect(tv(s).voteLetters).toBeNull();
    s = vote(s, ids[2] as string, slotFor(ids[2] as string));
    expect(s.phase.id).toBe('judge'); // the closing beat
    expect(tv(s).voteLetters).toEqual(s.votes);
  });
});
