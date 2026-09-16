// Typed access to content/*.json. Parsed once at module load; a broken pack fails fast at import
// time (and in the contract suite). Offers are dealt from the rng in init.
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { linesPackSchema, wordsPackSchema } from '../content/schema';
import linesJson from '../content/lines.json' with { type: 'json' };
import spicyJson from '../content/words-spicy.json' with { type: 'json' };
import familyJson from '../content/words.json' with { type: 'json' };

export const FAMILY = wordsPackSchema.parse(familyJson);
export const SPICY = wordsPackSchema.parse(spicyJson);
export const LINES = linesPackSchema.parse(linesJson);

function pool(spicy: boolean, difficulty: number): string[] {
  const words = spicy ? [...FAMILY.words, ...SPICY.words] : FAMILY.words;
  return words.filter((w) => w.difficulty === difficulty).map((w) => w.text);
}

/**
 * Three words per player — one easy, one medium, one hard — with no word offered twice while the
 * pool lasts (it wraps for absurd player counts). One shuffle per difficulty.
 */
export function dealOffers(
  rng: RngState,
  playerIds: readonly string[],
  spicy: boolean,
): [Record<string, string[]>, RngState] {
  let r = rng;
  const decks: string[][] = [];
  for (const difficulty of [1, 2, 3]) {
    const [deck, next] = shuffle(r, pool(spicy, difficulty));
    decks.push(deck);
    r = next;
  }
  const offers: Record<string, string[]> = {};
  playerIds.forEach((id, i) => {
    offers[id] = decks.map((deck) => deck[i % Math.max(1, deck.length)] ?? 'a mystery');
  });
  return [offers, r];
}
