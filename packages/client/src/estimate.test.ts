// I-189: the picker's minutes follow the settings and the room.
import { describe, expect, it } from 'vitest';
import type { GameSummary } from '@partybox/shared';
import { minutesFor } from './estimate';

const blanks = {
  id: 'blanks',
  minPlayers: 3,
  maxPlayers: 12,
  estimatedMinutes: 15,
  settings: [{ key: 'rounds', type: 'number', default: 6 }],
  estimate: { fixedSeconds: 20, perRoundSeconds: 45, perPlayerPerRoundSeconds: 3, roundsSetting: 'rounds' },
} as unknown as GameSummary;

describe('I-189: minutes from the pace', () => {
  it('six rounds with four players is about six minutes (the recaps: 5.5–7.5)', () => {
    expect(minutesFor(blanks, { rounds: 6 }, 4)).toBe(6);
  });
  it('more rounds and more players take longer; the default fills a missing setting', () => {
    expect(minutesFor(blanks, { rounds: 10 }, 12)).toBeGreaterThan(minutesFor(blanks, { rounds: 6 }, 4));
    expect(minutesFor(blanks, null, 4)).toBe(minutesFor(blanks, { rounds: 6 }, 4));
  });
  it('a game with no pace keeps its fixed number', () => {
    expect(minutesFor({ ...blanks, estimate: undefined }, { rounds: 6 }, 4)).toBe(15);
  });
});
