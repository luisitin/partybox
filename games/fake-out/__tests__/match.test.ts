// The local matcher stand-in (Part 00 §4 with the audit's errata and ruling 16), table-driven in
// English and Spanish: apostrophes and accents, plurals and articles, numbers, compounds, rejects.
import { describe, expect, it } from 'vitest';
import { matchAnswer, normalize, osa, sameAnswer, stems } from '../server/match';

describe('normalize', () => {
  it.each([
    ["don't", 'dont'],
    ['don´t', 'dont'],
    ["O'Neill", 'oneill'],
    ['Café', 'cafe'],
    ['piñata', 'pinata'],
    ['straße', 'strasse'],
    ['Ørsted', 'orsted'],
    ['Fish & Chips', 'fish and chips'],
    ['C+', 'c plus'],
    ['ice-cream', 'ice cream'],
    ['x/b.c,d', 'x b c d'],
    ['a/b', 'b'],
    ['🐧 penguin!!', 'penguin'],
    ['twenty-one', '21'],
    ['Twenty one guns', '21 guns'],
    ['the moose', 'moose'],
    ['A', 'a'],
    ['an apple a day', 'apple a day'],
    ['  lots   of   space ', 'lots of space'],
  ])('en: %s → %s', (input, norm) => expect(normalize(input).norm).toBe(norm));

  it.each([
    ['una piñata', 'pinata'],
    ['el Niño', 'nino'],
    ['treinta y uno', '31'],
    ['veintidós', '22'],
    ['pan & queso', 'pan y queso'],
  ])('es: %s → %s', (input, norm) => expect(normalize(input, 'es').norm).toBe(norm));

  it('compact drops the spaces', () => {
    expect(normalize('Ice Cream').compact).toBe('icecream');
  });
});

describe('stems meet singular and plural', () => {
  it.each([
    ['movies', 'movie'],
    ['horses', 'horse'],
    ['knives', 'knife'],
    ['wolves', 'wolf'],
    ['berries', 'berry'],
    ['boxes', 'box'],
    ['pies', 'pie'],
    ['toes', 'toe'],
    ['glasses', 'glass'],
    ['golf balls', 'golf ball'],
  ])('%s ~ %s', (a, b) => expect(stems(a)).toBe(stems(b)));

  it.each([
    ['luces', 'luz'],
    ['flores', 'flor'],
    ['noches', 'noche'],
  ])('es: %s ~ %s', (a, b) => expect(stems(a, 'es')).toBe(stems(b, 'es')));

  it('keeps words that only look plural (no s dropped after ss, us, is: bus, octopus, emus)', () => {
    expect(stems('bus')).toBe('bus');
    expect(stems('glass')).toBe('glass');
    expect(stems('octopus')).toBe('octopus');
    expect(stems('emus')).not.toBe(stems('emu')); // the spec's rule; packs list both forms
  });
});

describe('matchAnswer', () => {
  const penguin = {
    answer: 'penguin',
    accept: ['king penguin', 'emperor penguin', 'pengiun'],
    reject: ['puffin', 'pigeon'],
  };
  it.each([
    ['penguin', 'exact'],
    ['PENGUIN', 'exact'],
    ['the penguin', 'exact'],
    ['King Penguin', 'exact'],
    ['penguins', 'stem'],
    ['king penguins', 'stem'],
    ['pengwin', 'fuzzy'],
    ['pnguin', 'fuzzy'],
    ['puffin', 'none'],
    ['puffins', 'none'],
    ['pigeons', 'none'],
    ['moose', 'none'],
    ['', 'none'],
    ['!!!', 'none'],
  ])('%s → %s', (input, level) => expect(matchAnswer(input, penguin)).toBe(level));

  it('short targets allow no edits; longer ones more', () => {
    const cat = { answer: 'cat' };
    expect(matchAnswer('cot', cat)).toBe('none');
    const hippo = { answer: 'hippopotamus' };
    expect(matchAnswer('hipopotamus', hippo)).toBe('fuzzy');
    expect(matchAnswer('hipopotamsu', hippo)).toBe('fuzzy');
  });

  it('digits never fuzz, but number words meet digits', () => {
    const year = { answer: '1909' };
    expect(matchAnswer('1908', year)).toBe('none');
    const forty = { answer: '40' };
    expect(matchAnswer('forty', forty)).toBe('exact');
    expect(matchAnswer('fourty', forty)).toBe('none');
  });

  it('a reject blocks a fuzzy match that sits as close to it', () => {
    const car = { answer: 'carrot', reject: ['parrot'] };
    expect(matchAnswer('parrot', car)).toBe('none');
    expect(matchAnswer('carot', car)).toBe('fuzzy');
    expect(matchAnswer('marrot', car)).toBe('none');
  });
});

describe('sameAnswer (merging players lies)', () => {
  it.each([
    ['moose', 'Moose', true],
    ['a moose', 'the moose', true],
    ['moose', 'mooses', true],
    ['reindeer', 'raindeer', true],
    ['ice cream', 'icecream', true],
    ['cat', 'cot', false],
    ['reindeer', 'horse', false],
    ['1908', '1909', false],
    ['', '', false],
  ])('%s vs %s → %s', (a, b, same) => expect(sameAnswer(a as string, b as string)).toBe(same));
});

describe('osa', () => {
  it('counts a swap as one edit', () => {
    expect(osa('abcd', 'abdc')).toBe(1);
    expect(osa('kitten', 'sitting')).toBe(3);
    expect(osa('', 'abc')).toBe(3);
  });
});

describe('locale independence', () => {
  it('uses no locale APIs (Turkish dotted I cannot change the result)', () => {
    expect(normalize('İSTANBUL').compact).toBe('istanbul');
    expect(normalize('ISTANBUL').compact).toBe('istanbul');
  });
});
