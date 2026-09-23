// I-187: the key setting's words.
import { describe, expect, it } from 'vitest';
import type { GameSummary } from '@partybox/shared';
import { keySetting } from './keySetting';

const blanks = {
  id: 'blanks',
  settings: [
    {
      key: 'decks',
      label: 'Deck',
      type: 'select',
      default: 'wild',
      options: [
        { value: 'mild', label: 'Family night (Mild)' },
        { value: 'wild', label: 'WILD (all three decks)' },
      ],
    },
  ],
} as unknown as GameSummary;

describe('I-187: the key setting', () => {
  it('names the deck in short words, from the default or the pick', () => {
    expect(keySetting(blanks, {})).toMatchObject({ short: 'WILD', mark: '🔞' });
    expect(keySetting(blanks, { decks: 'mild' })).toMatchObject({ short: 'Family night', mark: '👪' });
  });
  it('other games have none', () => {
    expect(keySetting({ ...blanks, id: 'bingo' }, {})).toBeNull();
  });
});
