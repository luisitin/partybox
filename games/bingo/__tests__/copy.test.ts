// The TV's verdict copy for a failed claim (loop 272): the numbers, by name — and the same lines in
// Spanish (the owner, 2026-09-22), ordinals included.
import { describe, expect, it } from 'vitest';
import { holdLine, ordinal, otherTitle, whyNot, winHeadline, winTitle } from '../client/copy';
import { translatorFor } from '../client/words';

const card = Array.from({ length: 25 }, (_, i) => (i === 12 ? 0 : i + 1));
const en = translatorFor('en');
const es = translatorFor('es');

describe('whyNot', () => {
  it('names one never-called number and one missed square', () => {
    expect(whyNot({ card, red: [18], missing: [2] }, en)).toBe(
      '19 was never called · 3 was missed',
    );
  });
  it('joins two with "and", and folds more than two', () => {
    expect(whyNot({ card, red: [18, 20], missing: [] }, en)).toBe('19 and 21 were never called');
    expect(whyNot({ card, red: [0, 1, 2, 3], missing: [] }, en)).toBe(
      '1, 2 and 2 more were never called',
    );
  });
  it('never counts FREE as missed, and says nothing when there is nothing to say', () => {
    expect(whyNot({ card, red: [], missing: [12] }, en)).toBe('');
    expect(whyNot({ card, red: [], missing: [] }, en)).toBe('');
  });
  it('speaks Spanish on a Spanish device', () => {
    expect(whyNot({ card, red: [18, 20], missing: [2] }, es)).toBe(
      '19 y 21 nunca salieron · faltó marcar 3',
    );
    expect(whyNot({ card, red: [0, 1, 2, 3], missing: [] }, es)).toBe(
      '1, 2 y 2 más nunca salieron',
    );
  });
});

describe('the win lines', () => {
  const win = (patternBingos: number, pattern: 'line' | 'blackout' = 'line') => ({
    pattern,
    patternBingos,
    round: 2,
  });
  it('reads as before in English', () => {
    expect(winHeadline(win(1), 'Sam', en)).toBe('Sam wins round 2');
    expect(winHeadline(win(2), 'Sam', en)).toBe("Sam's 2nd bingo");
    expect(winTitle(win(1), null, en)).toBe('BINGO! You win round 2');
    expect(winTitle(win(3), 2, en)).toBe('BINGO! Your 3rd bingo in round 2 — card 2');
    expect(winTitle(win(1, 'blackout'), null, en)).toBe('BLACKOUT! Your 1st blackout in round 2');
    expect(otherTitle(win(2), 'Sam', en)).toBe('Sam — 2nd bingo in round 2');
    expect(holdLine(['Sam', 'Ana', 'Leo'], en)).toBe('⏸ Sam and 2 others are changing card style…');
  });
  it('writes Spanish ordinals the Spanish way', () => {
    expect([1, 2, 3, 4, 11, 21].map((n) => ordinal(n, 'es'))).toEqual([
      '1.er',
      '2.º',
      '3.er',
      '4.º',
      '11.º',
      '21.er',
    ]);
    expect(winHeadline(win(2), 'Sam', es)).toBe('2.º bingo de Sam');
    expect(winTitle(win(1, 'blackout'), 3, es)).toBe(
      '¡CARTÓN LLENO! Tu 1.er cartón lleno de la ronda 2 — cartón 3',
    );
    expect(otherTitle(win(1), 'Sam', es)).toBe('Sam tiene bingo');
  });
});
