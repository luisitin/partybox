// I-135 C (preview branch): the winner's fresh card for a same-pattern extension.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { after, callUntil, claim, daubAll, input, start } from './helpers';

const LINE = [0, 1, 2, 3, 4];

describe('I-135 C fresh card', () => {
  it('is dealt to the winner, advances the deal, and a win on it scores exactly half', () => {
    let s = callUntil(start({ cards: 1 }), 'a', LINE);
    s = daubAll(s, 'a', LINE);
    s = claim(s, 'a');
    expect(s.wins['a']).toBe(3);
    const rngBefore = s.rng;
    s = input(s, 'b', { type: 'continue', pattern: 'same' }, after(s));
    expect(s.phase.id).toBe('play');
    expect(s.round.cards['a']?.length).toBe(2);
    expect(s.round.half?.['a']).toEqual([1]);
    expect(s.rng).not.toEqual(rngBefore);
    // Ana's fresh card completes its top row: the pattern's 2nd bingo, worth 2 — half of it
    s = callUntil(s, 'a', LINE, 1);
    s = daubAll(s, 'a', LINE, 1);
    s = claim(s, 'a', 1);
    expect(s.round.winnerId).toBe('a');
    expect(game.tvView(s).claimPoints).toBe(1);
    expect(s.wins['a']).toBe(3 + 1);
  });
});
