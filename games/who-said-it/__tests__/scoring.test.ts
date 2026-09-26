// Scoring (SPEC §4.6): right, wrong and idle guessers; authors sit out; merged cards; awards
// (ties share); Knows You Best; ranks.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { awardsFor, knowsBest } from '../server/scoring';
import type { State } from '../server/types';
import { guess, start, timer, until, written } from './helpers';

/** Run the full private guessing run, then position the reveal on `author`'s card. */
function cardOf(s0: State, author: string, picks: Record<string, string> = {}): State {
  let s = until(s0, 'guess');
  const targetIdx = s.p.cards.findIndex((card) => card.authors.includes(author));
  if (targetIdx < 0 || targetIdx >= s.p.cards.length - 1)
    throw new Error(`no guessable card for ${author}`);
  for (let i = 0; i < s.p.cards.length - 1; i += 1) {
    if (i === targetIdx) for (const [g, t] of Object.entries(picks)) s = guess(s, g, t);
    s = timer(s);
  }
  s = until(s, 'reveal');
  for (let i = 0; i < targetIdx; i += 1) s = timer(timer(s));
  return s;
}

/** Play the current card's reveal to the flip. */
function flipWith(s: State): State {
  return timer(s);
}

const FIVE = { ana: 'avocado', ben: 'bacon', cy: 'sushi', dee: 'tacos', eli: 'pancakes' };

describe('per card', () => {
  it('+2 per right guesser, +1 to the author per guesser fooled, idle counts for nothing', () => {
    let s = cardOf(written(start({ players: 5, seed: 2 }), FIVE), 'ben', {
      ana: 'ben',
      cy: 'ben',
      dee: 'ana',
    });
    const before = { ...s.scores };
    // ana, cy right; dee wrong; eli idle; ben (the author) sits out.
    s = flipWith(s);
    expect(s.p.step).toBe('shown');
    const gained = (id: string): number => (s.scores[id] ?? 0) - (before[id] ?? 0);
    expect(gained('ana')).toBe(2);
    expect(gained('cy')).toBe(2);
    expect(gained('dee')).toBe(0);
    expect(gained('eli')).toBe(0);
    expect(gained('ben')).toBe(1);
  });

  it('a card nobody taps scores nothing', () => {
    let s = cardOf(written(start({ players: 5 }), FIVE), 'ana');
    s = flipWith(s);
    expect(Object.values(s.scores).every((v) => v === 0)).toBe(true);
  });

  it('scores are applied once, at the flip, and never go down', () => {
    let s = cardOf(written(start({ players: 5 }), FIVE), 'ana', { ben: 'ana' });
    expect(s.scores['ben']).toBe(0);
    s = timer(s);
    expect(s.scores['ben']).toBe(2);
    s = timer(s);
    expect(s.scores['ben']).toBe(2);
  });
});

describe('merged cards', () => {
  it('two identical answers are one card with both authors (sameAnswer)', () => {
    let s = written(start({ players: 5 }), { ...FIVE, eli: 'Avocados' });
    s = timer(s);
    expect(s.p.cards).toHaveLength(4);
    const merged = s.p.cards.find((c) => c.authors.length === 2);
    expect(merged?.authors).toEqual(['ana', 'eli']);
    expect(merged?.text).toBe('avocado');
  });

  it('naming either author is right; each author gets +1 per guesser who named neither', () => {
    let s = cardOf(written(start({ players: 5, seed: 2 }), { ...FIVE, eli: 'avocado' }), 'ana', {
      ben: 'eli',
      cy: 'ana',
      dee: 'ben',
    });
    s = flipWith(s);
    expect(s.scores).toMatchObject({ ben: 2, cy: 2, dee: 0, ana: 1, eli: 1 });
  });
});

describe('awards', () => {
  function played(): State {
    let s = cardOf(written(start({ players: 5, seed: 2 }), FIVE), 'ben', {
      ana: 'ben',
      cy: 'ben',
      dee: 'ana',
    });
    s = flipWith(s);
    return s;
  }

  it('skips an award nobody earned; ties share one', () => {
    const s = played();
    const byTitle = (t: string): string[] =>
      awardsFor(s)
        .filter((a) => a.title === t)
        .map((a) => a.playerId)
        .sort();
    expect(byTitle('Mind Reader')).toEqual(['ana', 'cy']);
    expect(byTitle('Mystery Guest')).toEqual(['ben']);
    expect(byTitle('Open Book')).toEqual(['ben']);
    const ids = awardsFor(s).map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Knows You Best names the pair and goes to the guesser', () => {
    const s = played();
    expect(knowsBest(s).map((k) => `${k.guesser}>${k.author}`).sort()).toEqual(['ana>ben', 'cy>ben']); // prettier-ignore
    const kyb = awardsFor(s).find((a) => a.id === 'knows-you-best-ana');
    expect(kyb?.description).toBe('Ana knows Ben best (1 of 1)');
  });

  it('an all-idle game has no awards and everyone ties for first', () => {
    const s = until(start({ players: 4, settings: { prompts: '1' } }), 'done');
    const r = game.results(s);
    expect(r?.awards).toEqual([]);
    expect(r?.winnerIds.sort()).toEqual(['ana', 'ben', 'cy', 'dee']);
    expect(r?.ranking.every((row) => row.rank === 1)).toBe(true);
  });

  it('results list every player from the start, including one who left', () => {
    let s = until(start({ players: 4, settings: { prompts: '1' } }), 'write');
    s = game.reduce(s, { type: 'player', now: s.phase.startedAt + 1, playerId: 'dee', connected: false, gone: 'left' }); // prettier-ignore
    s = until(s, 'done');
    expect(Object.keys(game.results(s)?.scores ?? {}).sort()).toEqual(['ana', 'ben', 'cy', 'dee']);
  });
});
