// The matcher stand-in (Part 00 §4 with the owner's errata) — table-driven, so the swap to the
// SDK's F5 module can run the same table. Also the speech stand-in's name rule.
import { describe, expect, it } from 'vitest';
import { isLegalClue, matchAnswer, normalize, sameAnswer, stem } from '../match';
import { readableName, toSpeakable } from '../server/speakable';

const pizza = {
  id: 'p',
  answer: 'pizza',
  accept: ['pizzas', 'piza', 'pizza pie'],
  reject: ['pasta', 'piazza'],
  family: ['pizz'],
};
const star = {
  id: 's',
  answer: 'starfish',
  accept: ['star fish', 'sea star', 'starfsh'],
  reject: ['swordfish', 'sunfish'],
  family: ['star', 'fish'],
};
const horse = {
  id: 'h',
  answer: 'horse',
  accept: ['horses', 'pony'],
  reject: ['hose', 'house'],
  family: [],
};

describe('normalize', () => {
  it.each([
    ["Don't", 'dont'],
    ['don´t', 'dont'],
    ['Crème Brûlée', 'creme brulee'],
    ['ice-cream', 'ice cream'],
    ['The Horse', 'horse'],
    ['A', 'a'],
    ['twenty-one', '21'],
    ['Straße', 'strasse'],
    ['rock & roll', 'rock and roll'],
    ['  lots   of   space ', 'lots of space'],
    ['🍕 pizza!!', 'pizza'],
  ])('%s → %s', (input, norm) => expect(normalize(input).norm).toBe(norm));

  it('Spanish: the article goes before numbers (una piñata stays a piñata)', () => {
    expect(normalize('una piñata', 'es').norm).toBe('pinata');
    expect(normalize('treinta y uno', 'es').norm).toBe('31');
    expect(normalize('los perros', 'es').norm).toBe('perros');
  });
});

describe('stem', () => {
  it.each([
    ['movies', 'movie'],
    ['horses', 'horse'],
    ['knives', 'knife'],
    ['berries', 'berry'],
    ['boxes', 'box'],
    ['pies', 'pie'],
    ['cakes', 'cake'],
  ])('%s and %s meet', (a, b) => expect(stem(a)).toBe(stem(b)));
  it('does not strip ss/us/is', () => {
    expect([stem('glass'), stem('bus'), stem('iris')]).toEqual(['glass', 'bus', 'iris']);
  });
  it('Spanish plurals', () => {
    expect(stem('luces', 'es')).toBe(stem('luz', 'es'));
    expect(stem('noches', 'es')).toBe(stem('noche', 'es'));
  });
});

describe('matchAnswer', () => {
  it.each([
    ['pizza', pizza, 'exact'],
    ['Pizza Pie', pizza, 'exact'],
    ['PIZZAS!', pizza, 'exact'],
    ['pizzaa', pizza, 'fuzzy'],
    ['piazza', pizza, 'none'],
    ['pasta', pizza, 'none'],
    ['starfishes', star, 'stem'],
    ['star-fish', star, 'exact'],
    ['sunfish', star, 'none'],
    ['horsse', horse, 'fuzzy'],
    ['hose', horse, 'none'],
    ['hoses', horse, 'none'],
    ['ponies', horse, 'stem'],
    ['cat', horse, 'none'],
    ['', horse, 'none'],
  ] as const)('%s vs %s', (input, item, level) => expect(matchAnswer(input, item)).toBe(level));
  it('digits never fuzz', () => {
    expect(matchAnswer('1985', { id: 'y', answer: '1984' })).toBe('none');
  });
});

describe('sameAnswer', () => {
  it.each([
    ['cheese', 'Cheese', true],
    ['slice', 'slices', true],
    ['pepperoni', 'peperoni', true],
    ['crust', 'crusty', false],
    ['cat', 'cot', false],
  ] as const)('%s ~ %s = %s', (a, b, same) => expect(sameAnswer(a, b)).toBe(same));
});

describe('isLegalClue', () => {
  it.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['abcdefghijklmnopqrstu', 'too-long'],
    ['two words', 'not-one-word'],
    ['starfish', 'is-secret'],
    ['Starfishes', 'is-secret'],
    ['star', 'contains-secret'],
    ['fishy', 'contains-secret'],
    ['starry', 'contains-secret'],
  ] as const)('%s → %s', (clue, reason) =>
    expect(isLegalClue(clue, star, { oneWord: true })).toEqual({ ok: false, reason }),
  );
  it.each(['ocean', 'tide-pool', 'reef', 'Coral'])('%s is fine', (clue) =>
    expect(isLegalClue(clue, star, { oneWord: true })).toEqual({ ok: true }),
  );
});

describe('speech stand-in', () => {
  it('skips names without vowels or mostly symbols', () => {
    expect([
      readableName('Sam'),
      readableName('xX_Slayer_Xx'),
      readableName('Brb'),
      readableName('1337'),
    ]).toEqual([true, true, false, false]);
  });
  it('shouting is lowercased, stretched letters collapse, hyphens read as spaces', () => {
    expect(toSpeakable('SOOOOO GOOD', { playerText: true })).toEqual([{ text: 'soo good' }]);
    expect(toSpeakable('hang-ten')).toEqual([{ text: 'hang ten' }]);
  });
  it('overrides respell whole words (case-sensitive unless anyCase)', () => {
    const o = { wifi: { say: 'why-fye', anyCase: true }, Nice: { say: 'Neece' } };
    expect(toSpeakable('Wifi.', { overrides: o })).toEqual([{ text: 'why-fye' }, { text: '.' }]);
    expect(toSpeakable('nice', { overrides: o })).toEqual([{ text: 'nice' }]);
  });
});
