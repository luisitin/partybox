// Typed access to content/*.json. Decks are imported statically (bundled, no I/O) and parsed once
// at module load, so a broken pack fails at import time and in the contract suite.
import { deckSchema } from '../content/schema';
import type { BlackCard, Deck, DeckId, WhiteCard } from '../content/schema';
import crudeJson from '../content/crude.json' with { type: 'json' };
import mildJson from '../content/mild.json' with { type: 'json' };
import wildJson from '../content/wild.json' with { type: 'json' };
import { SLOTS, servesOf, slotOf, slotsOf } from './fit';
import type { Slot } from './fit';
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

/** What a white card is, so a hand always holds a few answers for every kind of question (owner,
 *  review-loop #151: "at least 2 nouns, 2 verbs, 2 combinations"; 2026-09-18: at least 2 cards
 *  for each question type). The kinds are the fit model's slots (server/fit.ts): a `thing`, a
 *  `doing` (a gerund card) or a `person`; `whiteKind` is the card's primary slot, `whiteServes`
 *  every slot it reads well in, `blackSlot` what a prompt's blank wants, `whiteTier` how good the
 *  card is on its own (1 filler, 2 good, 3 great). */
export type WhiteKind = Slot;
export const WHITE_KINDS: readonly WhiteKind[] = SLOTS;

const WHITE_SERVES: Readonly<Record<string, readonly Slot[]>> = Object.fromEntries(
  ALL.flatMap((d) => d.white.map((c) => [c.id, servesOf(c)])),
);
const WHITE_TIER: Readonly<Record<string, 1 | 2 | 3>> = Object.fromEntries(
  ALL.flatMap((d) => d.white.map((c) => [c.id, (c.tier ?? 2) as 1 | 2 | 3])),
);
const BLACK_SLOT: Readonly<Record<string, Slot>> = Object.fromEntries(
  ALL.flatMap((d) => d.black.map((c) => [c.id, slotOf(c)])),
);
const BLACK_SLOTS: Readonly<Record<string, readonly Slot[]>> = Object.fromEntries(
  ALL.flatMap((d) => d.black.map((c) => [c.id, slotsOf(c)])),
);

export function whiteServes(id: string): readonly Slot[] {
  return WHITE_SERVES[id] ?? ['thing'];
}

export function whiteKind(id: string): WhiteKind {
  return whiteServes(id)[0] ?? 'thing';
}

export function whiteTier(id: string): 1 | 2 | 3 {
  return WHITE_TIER[id] ?? 2;
}

export function blackSlot(id: string | null): Slot {
  return (id && BLACK_SLOT[id]) || 'thing';
}

/** One slot per white card the prompt takes (a Pick 2 may want a person, then a thing). */
export function blackSlots(id: string | null): readonly Slot[] {
  return (id && BLACK_SLOTS[id]) || ['thing'];
}

export function blackTier(id: string): 1 | 2 | 3 {
  return (BLACK_BY_ID[id]?.tier ?? 2) as 1 | 2 | 3;
}
