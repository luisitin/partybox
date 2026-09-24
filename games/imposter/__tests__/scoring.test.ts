// SPEC §1.6 pinned with hand-built rounds: caught, escaped, stolen, a runoff, the two-imposter
// boundary tie, no votes, and a VIP-counted typed guess.
import { describe, expect, it } from 'vitest';
import { decide, decideRunoff } from '../server/tally';
import { input, roles, start, timer, until, vip, voteAll } from './helpers';
import type { State } from '../server/types';

function toVote(settings = {}, n = 6): State {
  return until(start(n, { talk: false, clueRounds: '1', ...settings }), 'vote');
}

describe('who gets accused', () => {
  const order = ['a', 'b', 'c', 'd', 'e'];
  it('one imposter: the single most-voted', () => {
    expect(decide({ a: ['b'], c: ['b'], d: ['a'] }, 1, order)).toEqual({
      accused: ['b'],
      runoff: null,
    });
  });
  it('a tie at the top goes to a runoff among the tied', () => {
    expect(decide({ a: ['b'], c: ['d'] }, 1, order)).toEqual({
      accused: [],
      runoff: { candidates: ['b', 'd'], slots: 1 },
    });
  });
  it('no votes: nobody', () => {
    expect(decide({}, 1, order)).toEqual({ accused: [], runoff: null });
  });
  it('two imposters: a tie across the boundary decides the remaining slot', () => {
    const votes = { a: ['b', 'c'], b: ['c', 'd'], c: ['b', 'e'], d: ['c', 'e'], e: ['c', 'd'] };
    // c 4, b 2, d 2, e 2 → c in; b/d/e tie for the second slot
    expect(decide(votes, 2, order)).toEqual({
      accused: ['c'],
      runoff: { candidates: ['b', 'd', 'e'], slots: 1 },
    });
  });
  it('a runoff still tied leaves the slot empty', () => {
    expect(decideRunoff({ a: ['b'], c: ['d'] }, ['b', 'd'], 1)).toEqual([]);
    expect(decideRunoff({ a: ['b'], c: ['d'], e: ['b'] }, ['b', 'd'], 1)).toEqual(['b']);
  });
});

describe('round points', () => {
  it('caught: +1 read per pick on the imposter, +2 per catch to every crew member; imposter 0 on a wrong guess', () => {
    let s = toVote({ lastChance: 'choices' });
    const { imps, crew } = roles(s);
    const imp = imps[0] as string;
    const other = crew[0] as string;
    s = voteAll(s, (v) => [v === imp ? other : v === other ? imp : imp]);
    s = until(s, 'lastChance');
    const wrong = (s.round.options ?? []).find((o) => o !== s.words[s.round.w]?.answer) as string;
    s = input(s, imp, { type: 'guess', option: wrong });
    expect(s.phase.id).toBe('wordReveal');
    expect(s.round.delta[imp]).toEqual({ pts: 0, why: [] });
    for (const id of crew) expect(s.round.delta[id]).toEqual({ pts: 3, why: ['read', 'caught'] });
  });

  it('escaped: +4 to the imposter, nothing to the crew', () => {
    let s = toVote();
    const { imps, crew } = roles(s);
    const imp = imps[0] as string;
    const patsy = crew[0] as string;
    s = voteAll(s, (v) => [v === patsy ? (crew[1] as string) : patsy]);
    s = until(s, 'wordReveal');
    expect(s.round.accused).toEqual([patsy]);
    expect(s.round.delta[imp]).toEqual({ pts: 4, why: ['escaped'] });
    expect(s.round.delta[patsy]?.pts).toBe(0);
  });

  it('stolen: +3 to a caught imposter who names the word', () => {
    let s = toVote({ lastChance: 'choices' });
    const imp = roles(s).imps[0] as string;
    s = voteAll(s, (v) => [v === imp ? (roles(s).crew[0] as string) : imp]);
    s = until(s, 'lastChance');
    s = input(s, imp, { type: 'guess', option: s.words[s.round.w]?.answer ?? '' });
    expect(s.round.delta[imp]).toEqual({ pts: 3, why: ['stole'] });
    s = until(s, 'scores');
    expect(s.scores[imp]).toBe(3);
  });

  it('no votes at all: nobody accused, the imposter escapes', () => {
    let s = toVote();
    s = until(s, 'wordReveal');
    const imp = roles(s).imps[0] as string;
    expect(s.round.accused).toEqual([]);
    expect(s.round.delta[imp]?.pts).toBe(4);
  });

  it('a runoff decides the accusation; the read point still uses the main vote', () => {
    let s = toVote({}, 5);
    const { imps, crew } = roles(s);
    const imp = imps[0] as string;
    const [c1, c2, c3, c4] = crew as [string, string, string, string];
    // main vote: imp 2 (c1, c2), c3 2 (imp, c4), c4 1 (c3) → tie imp/c3
    const main: Record<string, string> = { [c1]: imp, [c2]: imp, [imp]: c3, [c4]: c3, [c3]: c4 };
    s = voteAll(s, (v) => [main[v] as string]);
    expect(s.phase.id).toBe('voteReveal');
    s = timer(s);
    expect(s.phase.id).toBe('runoff');
    // runoff: everyone picks c3 (the imposter gets away)
    for (const v of s.seats) if (v !== c3) s = input(s, v, { type: 'vote', targets: [c3] });
    s = input(s, c3, { type: 'vote', targets: [imp] });
    s = until(s, 'wordReveal');
    expect(s.round.accused).toEqual([c3]);
    expect(s.round.delta[imp]?.pts).toBe(4);
    expect(s.round.delta[c1]).toEqual({ pts: 1, why: ['read'] });
    expect(s.round.delta[c4]?.pts).toBe(0);
  });

  it('typed mode: the VIP counts a rejected guess and the round re-scores', () => {
    let s = toVote({ lastChance: 'typed' });
    const imp = roles(s).imps[0] as string;
    s = voteAll(s, (v) => [v === imp ? (roles(s).crew[0] as string) : imp]);
    s = until(s, 'lastChance');
    expect(s.round.options).toBeNull();
    s = input(s, imp, { type: 'guess', text: 'definitely not it' });
    expect(s.round.delta[imp]?.pts).toBe(0);
    const ignored = input(s, roles(s).crew[0] as string, { type: 'countGuess' }, false);
    expect(ignored).toBe(s);
    s = input(s, roles(s).crew[0] as string, { type: 'countGuess' }, true);
    expect(s.round.guesses[imp]).toEqual({ said: 'definitely not it', ok: true, byVip: true });
    expect(s.round.delta[imp]).toEqual({ pts: 3, why: ['stole'] });
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('scores');
    expect(s.scores[imp]).toBe(3);
  });

  it('typed mode: a close misspelling counts on its own', () => {
    let s = toVote({ lastChance: 'typed' });
    const imp = roles(s).imps[0] as string;
    s = voteAll(s, (v) => [v === imp ? (roles(s).crew[0] as string) : imp]);
    s = until(s, 'lastChance');
    const word = s.words[s.round.w]?.answer ?? '';
    s = input(s, imp, { type: 'guess', text: ` ${word.toUpperCase()}s ` });
    expect(s.round.guesses[imp]?.ok).toBe(true);
  });
});
