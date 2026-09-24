// The local stand-ins for the foundation's matcher (sameAnswer, F5) and toSpeakable (F6): the rules
// this game leans on. Replaced by the SDK's own suites when those land.
import { describe, expect, it } from 'vitest';
import { normalize, sameAnswer } from '../server/match';
import { speakableName, toSpeakable } from '../server/speakable';

const said = (t: string, player = true): string =>
  toSpeakable(t, { player })
    .map((p) => p.text)
    .join(' ');

describe('sameAnswer', () => {
  it.each([
    ['avocado', 'Avocado!!', true],
    ['avocado', 'avocados', true],
    ['ice cream', 'icecream', true],
    ['the beach', 'Beach', true],
    ["don't know", 'dont know', true],
    ['pancakes', 'pancake', true],
    ['berries', 'berry', true],
    ['movies', 'movie', true],
    ['spaghetti', 'spagheti', true],
    ['crème brûlée', 'creme brulee', true],
    ['cat', 'car', false],
    ['1984', '1985', false],
    ['tacos', 'nachos', false],
    ['a', 'the', false],
    ['', '', false],
  ])('%s ≈ %s → %s', (a, b, same) => {
    expect(sameAnswer(a, b)).toBe(same);
  });

  it('normalize drops one leading article only when a word follows', () => {
    expect(normalize('The Office').norm).toBe('office');
    expect(normalize('The').norm).toBe('the');
    expect(normalize('una piñata', 'es').norm).toBe('pinata');
  });
});

describe('toSpeakable (stand-in)', () => {
  it('reads shouting in lowercase, keeps say-as-word acronyms, spells the rest', () => {
    expect(said('OMG THAT IS SO FUNNY')).toBe('OMG that is so funny');
    expect(said('I work for the FBI')).toBe('I work for the F B I');
  });

  it('drops emoji, collapses stretched words and !!!', () => {
    expect(said('soooooo good 😂🔥!!!')).toBe('soo good!');
  });

  it('numbers, years, money, percent', () => {
    expect(said('born in 1987', false)).toBe('born in nineteen eighty-seven');
    expect(said('$5 and 50%', false)).toBe('five dollars and fifty percent');
    expect(said('the 21st', false)).toBe('the twenty-first');
  });

  it('possessives read as plurals; contractions stay', () => {
    expect(said("Max's hat, don't touch", false)).toBe("Maxes hat, don't touch");
  });

  it('pacing punctuation and symbols', () => {
    expect(said('wait... what (really)', false)).toBe('wait, what, really,');
    expect(said('salt & pepper', false)).toBe('salt and pepper');
  });

  it('nothing speakable → no parts', () => {
    expect(toSpeakable('🙂🙂')).toEqual([]);
  });

  it('names: skips ones with no vowels or mostly symbols', () => {
    expect(speakableName('Ana')).toBe('Ana');
    expect(speakableName('xX_Slayer_Xx')).toBe('xX Slayer Xx');
    expect(speakableName('ZZZ')).toBeNull();
    expect(speakableName('#1!!')).toBeNull();
  });
});
