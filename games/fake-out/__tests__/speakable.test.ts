// toSpeakable stand-in (Part 00 §5.3–5.4): the spec's own examples, rule by rule, plus overrides.
import { describe, expect, it } from 'vitest';
import { toSpeakable } from '../server/speakable';
import { numberToWords, yearToWords } from '../server/spoken-numbers';

const say = (text: string, player = false): string =>
  toSpeakable(text, { player })
    .map((p) => p.text)
    .join(' ');

describe('toSpeakable', () => {
  it.each([
    [
      "Norway's King's Guard knighted a ___ named Nils Olav.",
      'Norways Kings Guard knighted a blank named Nils Olav.',
    ],
    ["the players' scores", 'the players scores'],
    ["James's hat", 'Jameses hat'],
    ["Max's dog", 'Maxes dog'],
    ["it's fine, don't worry", "it's fine, don't worry"],
    ['In 1932, Australia fought emus.', 'In nineteen thirty-two, Australia fought emus.'],
    ['It was 2007.', 'It was two thousand seven.'],
    ['the 1990s', 'the nineteen nineties'],
    ["the '90s", 'the nineties'],
    ['3.5 kg', 'three point five kg'],
    ['the 21st century', 'the twenty-first century'],
    ['50% off', 'fifty percent off'],
    ['$5 and $1.50', 'five dollars and one dollar fifty'],
    ['10-20 people', 'ten to twenty people'],
    ['at 7:30', 'at seven thirty'],
    ['1/2 a cup', 'one half a cup'],
    ['salt & pepper', 'salt and pepper'],
    ['#1 fan', 'number one fan'],
    ['cats/dogs', 'cats or dogs'],
    ['Dr. Who met Mr. Bean', 'Doctor Who met Mister Bean'],
    ['St. Louis', 'Saint Louis'],
    ['the U.S.A. and the FBI', 'the U S A and the F B I'],
    ['NASA and NATO', 'NASA and NATO'],
    ['Wait... what', 'Wait, what'],
    ['yes — no', 'yes, no'],
    ['a (tiny) dog', 'a, tiny, dog'],
    ['what?!', 'what?'],
    ['hi 🐧 there', 'hi there'],
  ])('%s → %s', (input, out) => expect(say(input)).toBe(out));

  it('player text: shouting is lowered, stretched words shrink, long lines are cut', () => {
    expect(say('OMG THAT IS SO FUNNY', true)).toBe('omg that is so funny');
    expect(say('sooooo good', true)).toBe('soo good');
    expect(say('word '.repeat(60), true).length).toBeLessThanOrEqual(140);
  });

  it('overrides replace whole words, case-sensitive unless anyCase, as their own part', () => {
    const parts = toSpeakable('Worcestershire sauce, worcestershire', {
      overrides: { Worcestershire: { say: 'Wuss-ter-sher' } },
    });
    expect(parts[0]).toEqual({ text: 'Wuss-ter-sher' });
    expect(parts.map((p) => p.text).join(' ')).toContain('worcestershire');
    const ipa = toSpeakable('Nils Olav', {
      overrides: { olav: { say: 'Oh-lahv', ipa: 'ˈoːlɑv', anyCase: true } },
    });
    expect(ipa).toContainEqual({ ipa: 'ˈoːlɑv', text: 'Oh-lahv' });
  });
});

describe('spoken numbers', () => {
  it.each([
    [0, 'zero'],
    [42, 'forty-two'],
    [116, 'one hundred and sixteen'],
    [1_000_000, 'one million'],
  ])('%i → %s', (n, words) => expect(numberToWords(n)).toBe(words));

  it.each([
    [1987, 'nineteen eighty-seven'],
    [1900, 'nineteen hundred'],
    [1906, 'nineteen oh six'],
    [2000, 'two thousand'],
    [1066, 'ten sixty-six'],
  ])('year %i → %s', (y, words) => expect(yearToWords(y)).toBe(words));
});
