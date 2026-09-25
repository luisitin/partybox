// Typed access to content/*.json. Parsed once at module load; a broken pack fails fast at import
// time (and in the contract suite). Offers are dealt from the rng in init.
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import {
  linesEsPackSchema,
  linesPackSchema,
  wordsEsPackSchema,
  wordsPackSchema,
} from '../content/schema';
import type { LinesPack } from '../content/schema';
import linesEsJson from '../content/lines.es.json' with { type: 'json' };
import linesJson from '../content/lines.json' with { type: 'json' };
import spicyEsJson from '../content/words-spicy.es.json' with { type: 'json' };
import spicyJson from '../content/words-spicy.json' with { type: 'json' };
import familyEsJson from '../content/words.es.json' with { type: 'json' };
import familyJson from '../content/words.json' with { type: 'json' };

export type ContentLang = 'en' | 'es';

export const FAMILY = wordsPackSchema.parse(familyJson);
export const SPICY = wordsPackSchema.parse(spicyJson);
export const LINES = linesPackSchema.parse(linesJson);
/** ADR-054: the Spanish deck (content/*.es.json), one entry per English word. */
export const FAMILY_ES = wordsEsPackSchema.parse(familyEsJson);
export const SPICY_ES = wordsEsPackSchema.parse(spicyEsJson);
export const LINES_ES: LinesPack = linesEsPackSchema.parse(linesEsJson);

/** The verdict lines and the bot's guesses in the game's content language. */
export function linesFor(lang: ContentLang | undefined): LinesPack {
  return lang === 'es' ? LINES_ES : LINES;
}

/** The fallback word when a pool runs dry (never in practice). */
export function mysteryWord(lang: ContentLang | undefined): string {
  return lang === 'es' ? 'un misterio' : 'a mystery';
}

function pool(spicy: boolean, difficulty: number, lang: ContentLang): string[] {
  const [family, extra] = lang === 'es' ? [FAMILY_ES, SPICY_ES] : [FAMILY, SPICY];
  const words: { text: string; difficulty: number }[] = spicy
    ? [...family.words, ...extra.words]
    : family.words;
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
  lang: ContentLang = 'en',
): [Record<string, string[]>, RngState] {
  let r = rng;
  const decks: string[][] = [];
  for (const difficulty of [1, 2, 3]) {
    const [deck, next] = shuffle(r, pool(spicy, difficulty, lang));
    decks.push(deck);
    r = next;
  }
  const offers: Record<string, string[]> = {};
  playerIds.forEach((id, i) => {
    offers[id] = decks.map((deck) => deck[i % Math.max(1, deck.length)] ?? mysteryWord(lang));
  });
  return [offers, r];
}
