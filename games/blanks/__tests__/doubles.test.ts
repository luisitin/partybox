// I-158 B: every game deals exactly one Pick 2 / Pick 3 card, in the middle — round 4 of six, round
// 8 of fifteen — on every deck (before, the deck's own spacing put the first one ~17 rounds deep,
// so no six-round game on mild, adults or wild ever saw one).
import { describe, expect, it } from 'vitest';
import { seedRng, shuffle } from '@partybox/game-sdk';
import { orderBlackDeck } from '../server/cards';
import { blackCard, blackPool } from '../server/content';
import { DECK_PRESETS } from '../server/types';

/** The rounds (1-based) whose black card is a Pick 2 or Pick 3, within a game of `rounds`. */
function multiRounds(
  seed: number,
  preset: (typeof DECK_PRESETS)[number],
  rounds: number,
): number[] {
  const [shuffled] = shuffle(seedRng(seed), blackPool(preset));
  const deck = orderBlackDeck(shuffled, rounds, 'one');
  return deck
    .slice(0, rounds)
    .map((id, i) => (blackCard(id).pick > 1 ? i + 1 : 0))
    .filter((r) => r > 0);
}

describe('one double-blank card, mid-game', () => {
  it.each(DECK_PRESETS)('%s: a six-round game deals exactly one, in round 4', (preset) => {
    for (let seed = 1; seed <= 40; seed++) expect(multiRounds(seed, preset, 6)).toEqual([4]);
  });

  it.each(DECK_PRESETS)('%s: a fifteen-round game deals one in round 8', (preset) => {
    for (let seed = 1; seed <= 40; seed++) expect(multiRounds(seed, preset, 15)).toContain(8);
  });
});
