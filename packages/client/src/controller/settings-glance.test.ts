// I-648: a setting's value in words, for the guests' glance.
import { describe, expect, it } from 'vitest';
import type { GameSummary } from '@partybox/shared';
import { settingValue } from './tunedLine';

const game = {
  id: 'x',
  settings: [
    { key: 'rounds', type: 'number', label: 'Rounds', default: 6 },
    { key: 'timed', type: 'boolean', label: 'Timed rounds', default: false },
    {
      key: 'decks',
      type: 'select',
      label: 'Decks',
      default: 'wild',
      options: [
        { value: 'wild', label: 'Wild' },
        { value: 'mild', label: 'Mild' },
      ],
    },
  ],
} as unknown as GameSummary;
const [rounds, timed, decks] = game.settings as [
  GameSummary['settings'][number],
  GameSummary['settings'][number],
  GameSummary['settings'][number],
];

describe('I-648: settingValue', () => {
  it('uses the default when the room has no value', () => {
    expect(settingValue(game, rounds, undefined, 'en')).toBe('6');
    expect(settingValue(game, timed, undefined, 'en')).toMatch(/off/i);
  });
  it('words a select by its label', () => {
    expect(settingValue(game, decks, 'mild', 'en')).toBe('Mild');
  });
});
