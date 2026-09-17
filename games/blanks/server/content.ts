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
