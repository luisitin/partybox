// I-392 A: a wrong claim is judged on the line the player daubed.
import { describe, expect, it } from 'vitest';
import { evaluate } from '../server/patterns';
import { lineName, whyNot } from '../client/copy';
import { translatorFor } from '../client/words';

const card = Array.from({ length: 25 }, (_, i) => (i === 12 ? 0 : i + 1));

describe('I-392: the line a claim is judged on', () => {
  it('a top row of daubs (mostly never called) is judged on the top row, not the middle one', () => {
    const called = [2, 50, 51];
    const claim = evaluate('p', 0, card, [0, 1, 2, 3, 4], called, 'line');
    expect(claim.cells).toEqual([0, 1, 2, 3, 4]);
    expect(claim.valid).toBe(false);
    expect(claim.red).toEqual([0, 2, 3, 4]);
  });
  it('a real bingo still wins on its line', () => {
    const called = [16, 17, 18, 19, 20];
    const claim = evaluate('p', 0, card, [15, 16, 17, 18, 19, 0, 1], called, 'line');
    expect(claim.valid).toBe(true);
    expect(claim.cells).toEqual([15, 16, 17, 18, 19]);
  });
});

describe('I-392 B: the verdict names the checked line', () => {
  const en = translatorFor('en');
  const es = translatorFor('es');
  it('rows, columns and the diagonals', () => {
    expect(lineName([0, 1, 2, 3, 4], en)).toBe('Top row');
    expect(lineName([10, 11, 12, 13, 14], en)).toBe('Middle row');
    expect(lineName([20, 21, 22, 23, 24], es)).toBe('Fila de abajo');
    expect(lineName([2, 7, 12, 17, 22], en)).toBe('The N column');
    expect(lineName([0, 6, 12, 18, 24], en)).toBe('The diagonal');
    expect(lineName([0, 4, 20, 24], en)).toBeNull(); // corners: not one line
  });
  it('leads the reason with it', () => {
    expect(whyNot({ card, red: [0, 1], missing: [], cells: [0, 1, 2, 3, 4] }, en)).toBe(
      'Top row: 1 and 2 were never called',
    );
  });
});
