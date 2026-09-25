// I-179 B: the vote grid's anchor keeps the blank's own punctuation and never trails "…" after a
// finished sentence (tune-in's review 967834).
import { describe, expect, it } from 'vitest';
import { anchorOf } from '../client/anchor';

describe('anchorOf', () => {
  it('keeps end punctuation on the blank, with no ellipsis after it', () => {
    expect(anchorOf('I never leave home without ____.')).toBe('…home without ____.');
    expect(anchorOf('What ruined the party? ____!')).toBe('…the party? ____!');
  });
  it('keeps mid-sentence punctuation and trails the next words', () => {
    expect(anchorOf('____: the secret to a long life.')).toBe('____: the secret…');
    expect(anchorOf('Zookeeper fired for ____ with the dolphins.')).toBe(
      '…fired for ____ with the…',
    );
  });
  it('a blank at the start, and a card with no blank', () => {
    expect(anchorOf('____ is why I cry in the shower.')).toBe('____ is why…');
    expect(anchorOf('No blank here.')).toBe('____');
  });
});
