// I-147 (preview branch): sudden death — only the tied players play the extra card.
import { describe, expect, it } from 'vitest';
import { afterResult } from '../server/flow';
import { cv, play, playAll, start, toAnswer, topCards, tv } from './helpers';

describe('I-147 sudden death', () => {
  it('deals the extra card to the tied players only; everyone else waits to vote', () => {
    const s0 = start({ players: 4, rounds: 3 });
    const tiedEnd = { ...s0, round: 3, scores: { ana: 2, ben: 2, cleo: 1, dev: 0 } };
    let s = afterResult(tiedEnd, s0.phase.startedAt + 1000);
    expect(s.phase.id).toBe('intro');
    expect([...(s.tied ?? [])].sort()).toEqual(['ana', 'ben']);
    expect(s.round).toBe(3);
    s = toAnswer(s);
    expect(s.phase.id).toBe('answer');
    // outside the tie: no hand, a card is refused, and nobody waits on them
    expect(cv(s, 'cleo').hand).toEqual([]);
    expect(cv(s, 'cleo').sitsOut).toBe(true);
    expect(cv(s, 'ana').sitsOut).toBe(false);
    expect(play(s, 'cleo', topCards(s, 'cleo')).submissions).toEqual({});
    expect(tv(s).playersExpected).toBe(2);
    // the tied two play; the card is theirs alone, and the reading starts
    s = playAll(s);
    expect(Object.keys(s.submissions).sort()).toEqual(['ana', 'ben']);
    expect(s.phase.id).toBe('reveal');
  });

  it('in judge mode, the tie-break judge comes from outside the tie', () => {
    const s0 = start({ players: 4, rounds: 3, judge: 'czar' });
    const tiedEnd = { ...s0, round: 3, scores: { ana: 2, ben: 2, cleo: 1, dev: 0 } };
    const s = afterResult(tiedEnd, s0.phase.startedAt + 1000);
    expect(s.czarId === 'cleo' || s.czarId === 'dev').toBe(true);
  });
});
