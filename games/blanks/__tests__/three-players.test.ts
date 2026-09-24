// I-172 B: a 1-1-1 split at three goes to the reader.
import { describe, expect, it } from 'vitest';
import { playAll, readAll, reduce, start, timer, toAnswer, tv } from './helpers';

describe('I-172 B: the reader breaks a three-way split', () => {
  it('1-1-1 hands the round to the reader; the next round votes again', () => {
    let s = readAll(playAll(toAnswer(start({ players: 3, timed: true }))));
    expect(s.phase.id).toBe('judge');
    // a cycle: each votes for the next one's card
    const ids = [...s.slots];
    for (let i = 0; i < ids.length; i += 1) {
      const voter = ids[i] as string;
      const slot = (i + 1) % ids.length;
      s = reduce(s, { type: 'input', now: s.phase.startedAt + 500, playerId: voter, input: { type: 'vote', slot } });
    }
    while (s.phase.id === 'judge' && !s.tieBreakBy) s = timer(s);
    expect(s.phase.id).toBe('judge');
    expect(s.tieBreakBy).toBe(s.readerId); // the helper's rooms have no voice: the reader breaks it
    expect(tv(s).judgeMode).toBe('czar');
    const reader = s.tieBreakBy as string;
    const pick = s.slots.findIndex((id) => id !== reader);
    s = reduce(s, { type: 'input', now: s.phase.startedAt + 500, playerId: reader, input: { type: 'vote', slot: pick } });
    while (s.phase.id === 'judge') s = timer(s);
    expect(s.phase.id).toBe('result');
    expect(s.winners).toEqual([s.slots[pick]]);
    while (s.phase.id !== 'answer' && s.phase.id !== 'final') s = timer(s);
    expect(s.settings.judge).toBe('vote');
  });
});
