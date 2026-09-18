// Typed access to content/*.json. Decks are imported statically (bundled, no I/O) and parsed once
// at module load, so a broken pack fails at import time and in the contract suite.
import { deckSchema } from '../content/schema';
import type { BlackCard, Deck, DeckId, WhiteCard } from '../content/schema';
import crudeJson from '../content/crude.json' with { type: 'json' };
import mildJson from '../content/mild.json' with { type: 'json' };
import wildJson from '../content/wild.json' with { type: 'json' };
import type { DeckPreset } from './types';

export const DECKS: Readonly<Record<DeckId, Deck>> = {
  mild: deckSchema.parse(mildJson),
  crude: deckSchema.parse(crudeJson),
  wild: deckSchema.parse(wildJson),
};

const ALL: Deck[] = [DECKS.mild, DECKS.crude, DECKS.wild];
const BLACK_BY_ID: Readonly<Record<string, BlackCard>> = Object.fromEntries(
  ALL.flatMap((d) => d.black.map((c) => [c.id, c])),
);
const WHITE_BY_ID: Readonly<Record<string, WhiteCard>> = Object.fromEntries(
  ALL.flatMap((d) => d.white.map((c) => [c.id, c])),
);

/** The decks a preset mixes together (manifest "decks" setting). */
export function decksFor(preset: DeckPreset): DeckId[] {
  switch (preset) {
    case 'mild':
      return ['mild'];
    case 'adults':
      return ['mild', 'crude'];
    case 'wild-only':
      return ['wild'];
    default:
      return ['mild', 'crude', 'wild'];
  }
}

export function blackPool(preset: DeckPreset): string[] {
  return decksFor(preset).flatMap((d) => DECKS[d].black.map((c) => c.id));
}

export function whitePool(preset: DeckPreset): string[] {
  return decksFor(preset).flatMap((d) => DECKS[d].white.map((c) => c.id));
}

const MISSING_BLACK: BlackCard = { id: 'mb0', text: '(missing card) ____.', pick: 1, draw: 0 };

/** A black card by id; a fixture with an unknown id still renders (reduce/views stay total). */
export function blackCard(id: string | null): BlackCard {
  return (id && BLACK_BY_ID[id]) || MISSING_BLACK;
}

export function whiteText(id: string): string {
  return WHITE_BY_ID[id]?.text ?? '(missing card)';
}

/** What shape a white card is, so a hand always holds a few of each (owner, review-loop #151:
 *  "at least 2 nouns, 2 verbs, 2 combinations, so you always have options"). Heuristic on the
 *  text: a card that starts with a gerund ("Yodeling.", "Quietly winning Monopoly.") is a `doing`;
 *  one with a linking word ("Bird poop on a brand-new car." — "with", "in", "who", "and"…) is a
 *  `combo`; the rest are plain `thing`s ("Beans.", "A very small horse."). */
export type WhiteKind = 'thing' | 'doing' | 'combo';
export const WHITE_KINDS: readonly WhiteKind[] = ['thing', 'doing', 'combo'];

const NOT_GERUND =
  /^(thing|something|nothing|everything|anything|ring|king|wing|string|spring|bling|morning|evening|wedding|building|feeling|ceiling|pudding|stocking|clothing|sibling|darling|during)$/i;
const ADVERB =
  /^(not|quietly|slowly|loudly|secretly|aggressively|extremely|slightly|accidentally|finally|casually|barely|openly|silently|gently|violently|briefly|nearly|almost|never|always|just|still|only|really|very|too|softly|angrily|politely|deliberately|repeatedly|calmly|suddenly|passive)$/i;
const LINK =
  /\b(with|in|on|at|for|of|from|to|and|who|that|about|after|before|under|over|into|without|during|behind|near|by|inside|outside|through|like|as)\b/i;

export function whiteKindOf(text: string): WhiteKind {
  const words = text.replace(/[^A-Za-z' ]/g, '').split(/\s+/);
  const gerund = (w: string | undefined): boolean =>
    w !== undefined && /ing$/i.test(w) && !NOT_GERUND.test(w);
  if (gerund(words[0]) || (ADVERB.test(words[0] ?? '') && gerund(words[1]))) return 'doing';
  if (LINK.test(text)) return 'combo';
  return 'thing';
}

const WHITE_KIND: Readonly<Record<string, WhiteKind>> = Object.fromEntries(
  ALL.flatMap((d) => d.white.map((c) => [c.id, whiteKindOf(c.text)])),
);

export function whiteKind(id: string): WhiteKind {
  return WHITE_KIND[id] ?? 'thing';
}
