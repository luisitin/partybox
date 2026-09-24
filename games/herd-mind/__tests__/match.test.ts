// The matcher STAND-IN (server/match.ts) until `@partybox/game-sdk/match` lands: foundation §4 as
// the audit amended it. When F5 ships, these cases move to its table and this file goes.
import { describe, expect, it } from 'vitest';
import { matchAnswer, normalize, sameAnswer, stem } from '../server/match';

describe('normalize', () => {
  it.each([
    ["Don't", 'dont'],
    ['don´t', 'dont'],
    ['Crème Brûlée', 'creme brulee'],
    ['Straße', 'strasse'],
    ['mac & cheese', 'mac and cheese'],
    ['ice-cream', 'ice cream'],
    ['The Beatles', 'beatles'],
    ['a', 'a'],
    ['twenty-one', '21'],
    ['Seven', '7'],
    ['🍕 pizza!!', 'pizza'],
    ['  lots   of   space ', 'lots of space'],
  ])('%s → %s', (input, norm) => {
    expect(normalize(input, 'en').norm).toBe(norm);
  });

  it('Spanish: the article goes before numbers, so "una piñata" stays a piñata', () => {
    expect(normalize('una piñata', 'es').norm).toBe('pinata');
    expect(normalize('treinta y dos', 'es').norm).toBe('32');
    expect(normalize('pan & queso', 'es').norm).toBe('pan y queso');
  });

  it('compact drops the spaces', () => {
    expect(normalize('Ice Cream', 'en').compact).toBe('icecream');
  });
});

describe('stem', () => {
  it.each([
    ['movies', 'movie'],
    ['horses', 'horse'],
    ['knives', 'knife'],
    ['olives', 'olive'],
    ['berries', 'berry'],
    ['boxes', 'box'],
    ['pies', 'pie'],
    ['fries', 'fry'],
    ['tomatoes', 'tomato'],
    ['wolves', 'wolf'],
  ])('%s meets %s', (a, b) => {
    expect(stem(a, 'en')).toBe(stem(b, 'en'));
  });

  it('keeps glass, bus and cactus whole', () => {
    expect([stem('glass', 'en'), stem('bus', 'en'), stem('cactus', 'en')]).toEqual([
      'glass',
      'bus',
      'cactus',
    ]);
  });

  it('Spanish plurals meet', () => {
    expect(stem('luces', 'es')).toBe(stem('luz', 'es'));
    expect(stem('noches', 'es')).toBe(stem('noche', 'es'));
  });
});

describe('matchAnswer', () => {
  const penguin = { answer: 'penguin', accept: ['emperor penguin'], reject: ['puffin'] };
  it.each([
    ['Penguin', 'exact'],
    ['emperor-penguin', 'exact'],
    ['penguins', 'stem'],
    ['pengiun', 'fuzzy'],
    ['puffin', 'none'],
    ['puffins', 'none'],
    ['parrot', 'none'],
    ['', 'none'],
  ])('%s → %s', (input, level) => {
    expect(matchAnswer(input, penguin, 'en')).toBe(level);
  });

  it('short targets allow no typos; digits never fuzz', () => {
    expect(matchAnswer('cst', { answer: 'cat' }, 'en')).toBe('none');
    expect(matchAnswer('1985', { answer: '1984' }, 'en')).toBe('none');
    expect(matchAnswer('seven', { answer: '7' }, 'en')).toBe('exact');
  });

  it('a reject at least as close as the target blocks the fuzzy match', () => {
    expect(matchAnswer('hose', { answer: 'horse', reject: ['hose'] }, 'en')).toBe('none');
  });
});

describe('sameAnswer', () => {
  it.each([
    ['Coke', 'coke', true],
    ['burger', 'burgers', true],
    ['spaghetti', 'spagetti', true],
    ['cat', 'cot', false],
    ['coke', 'cola', false],
    ['12', '13', false],
    ['', '', false],
  ])('%s ~ %s → %s', (a, b, same) => {
    expect(sameAnswer(a, b, 'en')).toBe(same);
  });
});
