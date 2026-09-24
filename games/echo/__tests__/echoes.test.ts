// §7.17 Echoes: identical clues, plurals and 6+ letter typos cancel; card/cart survive; split and
// join in `check`; a 3-player duplicate pair is refused. Plus the matcher stand-in's key cases.
import { describe, expect, it } from 'vitest';
import { isLegalClue, matchAnswer, normalize, sameAnswer } from '../server/match/index';
import { atClue, clue, input, TELESCOPE, withClues } from './helpers';

describe('matcher stand-in (Part 00 §4 + audit errata)', () => {
  it.each([
    ['star', 'stars', true],
    ['Stars', 'STAR', true],
    ['pepperoni', 'peperoni', true],
    ['card', 'cart', false],
    ['movies', 'movie', true],
    ['horses', 'horse', true],
    ['knives', 'knife', true],
    ['berries', 'berry', true],
    ['colour', 'color', false],
    ['1984', '1985', false],
  ])('sameAnswer(%s, %s) = %s', (a, b, same) => {
    expect(sameAnswer(a, b, 'en')).toBe(same);
  });

  it('normalizes apostrophes, accents, articles and number words', () => {
    expect(normalize('Don´t', 'en').compact).toBe('dont');
    expect(normalize('The Piñata', 'en').norm).toBe('pinata');
    expect(normalize('twenty-one', 'en').norm).toBe('21');
    expect(normalize('una piñata', 'es').norm).toBe('pinata');
    expect(normalize('the', 'en').norm).toBe('the');
    expect(normalize('straße', 'en').norm).toBe('strasse');
  });

  it('matches guesses at the levels the spec gives', () => {
    expect(matchAnswer('Telescopes', TELESCOPE, 'en')).toBe('exact');
    expect(matchAnswer('the telescope', TELESCOPE, 'en')).toBe('exact');
    expect(matchAnswer('telescpoe', TELESCOPE, 'en')).toBe('fuzzy');
    expect(matchAnswer('microscope', TELESCOPE, 'en')).toBe('none');
    expect(matchAnswer('microscopes', TELESCOPE, 'en')).toBe('none');
    expect(matchAnswer('periscope', TELESCOPE, 'en')).toBe('none');
  });

  it.each([
    ['', 'empty'],
    ['abcdefghijklmnopqrstu', 'too-long'],
    ['big lens', 'not-one-word'],
    ['telescopes', 'is-secret'],
    ['radiotelescope', 'contains-secret'],
    ['television', 'contains-secret'],
    ['scope', 'contains-secret'],
  ])('isLegalClue(%s) → %s', (text, reason) => {
    expect(isLegalClue(text, TELESCOPE, 'en', { oneWord: true, maxChars: 20 })).toEqual({
      ok: false,
      reason,
    });
  });

  it('allows a hyphenated clue as one word, and clues inside an accept form', () => {
    const bee = { answer: 'bee', accept: ['bees', 'honeybee'], family: [] };
    expect(isLegalClue('star-gazer', TELESCOPE, 'en', { oneWord: true })).toEqual({ ok: true });
    expect(isLegalClue('honey', bee, 'en', { oneWord: true })).toEqual({ ok: true });
  });
});

describe('automatic echoes', () => {
  it('cancels identical clues and plurals; the rest survive', () => {
    const s = withClues(atClue(5), ['stars', 'Star', 'lens', 'Galileo']);
    expect(s.phase.id).toBe('check');
    const rows = input(s, 'p2', { type: 'ok' }).w.groups ?? [];
    expect(rows.filter((g) => g.echo).map((g) => g.refs.map((r) => r.by))).toEqual([['p2', 'p3']]);
    expect(rows.filter((g) => !g.echo)).toHaveLength(2);
  });

  it('cancels a 6+ letter typo pair but not card/cart', () => {
    let s = withClues(atClue(5), ['astronomer', 'astronomre', 'card', 'cart']);
    const groups = s.w.groups ?? [];
    expect(groups.filter((g) => g.echo)).toHaveLength(1);
    expect(groups.filter((g) => !g.echo)).toHaveLength(2);
    s = input(s, 'p2', { type: 'ok' });
    expect(s.phase.id).toBe('check');
  });

  it('Not the same splits an echo; tapping again undoes it', () => {
    const s = withClues(atClue(5), ['stars', 'stars', 'lens', 'zoom']);
    const echo = (s.w.groups ?? []).find((g) => g.echo);
    expect(echo).toBeDefined();
    const split = input(s, 'p4', { type: 'split', group: echo?.id ?? '' });
    expect(split.w.groups?.find((g) => g.id === echo?.id)?.echo).toBe(false);
    const undone = input(split, 'p5', { type: 'split', group: echo?.id ?? '' });
    expect(undone.w.groups?.find((g) => g.id === echo?.id)?.echo).toBe(true);
  });

  it('Same word joins two survivors into an echo (planet vs planes the other way)', () => {
    const s = withClues(atClue(5), ['colour', 'color', 'lens', 'zoom']);
    const [a, b] = (s.w.groups ?? []).filter(
      (g) => !g.echo && ['colour', 'color'].includes(s.w.clues[g.refs[0]?.by ?? '']?.[0] ?? ''),
    );
    const joined = input(s, 'p2', { type: 'join', a: a?.id ?? '', b: b?.id ?? '' });
    expect(joined.w.groups?.filter((g) => g.echo)).toHaveLength(1);
    expect(joined.w.groups).toHaveLength(3);
  });

  it('the guesser cannot split, join or ok', () => {
    const s = withClues(atClue(5), ['stars', 'stars', 'lens', 'zoom']);
    const echo = (s.w.groups ?? []).find((g) => g.echo);
    expect(input(s, 'p1', { type: 'split', group: echo?.id ?? '' })).toBe(s);
    expect(input(s, 'p1', { type: 'ok' })).toBe(s);
  });

  it('a 3-player clue-giver must give two different words', () => {
    let s = atClue(3);
    expect(s.twoClues).toBe(true);
    s = clue(s, 'p2', 'stars', 'Star');
    expect(s.w.rejects['p2']).toBe('twin');
    expect(s.w.clues['p2']).toBeUndefined();
    s = clue(s, 'p2', 'stars');
    expect(s.w.rejects['p2']).toBe('count');
    s = clue(s, 'p2', 'stars', 'lens');
    expect(s.w.clues['p2']).toEqual(['stars', 'lens']);
    expect(s.w.rejects['p2']).toBeUndefined();
  });

  it('two texts outside a 3-player game are ignored; an illegal clue is refused with its reason', () => {
    const s = atClue(5);
    expect(clue(s, 'p2', 'stars', 'lens')).toBe(s);
    const refused = clue(s, 'p2', 'telescopes');
    expect(refused.w.rejects['p2']).toBe('is-secret');
    expect(refused.w.clues['p2']).toBeUndefined();
  });

  it('a resent clue replaces the earlier one', () => {
    const s = clue(clue(atClue(5), 'p2', 'stars'), 'p2', 'lens');
    expect(s.w.clues['p2']).toEqual(['lens']);
  });
});
