// Typed access to content/*.json (host-only: never imported from client/**). init draws exactly
// the spectra a game needs (foundation §2.5); the rest never enters state or a view.
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import familyJson from '../content/family.json' with { type: 'json' };
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };
import { pronunciationsSchema, spectrumPackSchema } from '../content/schema';
import type { SpectrumItem } from '../content/schema';

// Parsed once; a broken pack fails at import time (and in the contract suite).
export const FAMILY = spectrumPackSchema.parse(familyJson);
export const SPICY = spectrumPackSchema.parse(spicyJson);
export const PRONUNCIATIONS = pronunciationsSchema.parse(pronunciationsJson);

const BY_ID = new Map<string, SpectrumItem>(
  [...FAMILY.spectra, ...SPICY.spectra].map((s) => [s.id, s]),
);

/** A spectrum by id — the bank a bot treats as general knowledge (spec §5.11). */
export function spectrumById(id: string): SpectrumItem | null {
  return BY_ID.get(id) ?? null;
}

/** `count` spectra for one game. Spicy on: half of them from the spicy pack (NOTES.md), the rest
 *  family, shuffled together so the spice lands anywhere. */
export function drawSpectra(
  rng: RngState,
  count: number,
  spicy: boolean,
): [SpectrumItem[], RngState] {
  const [family, afterFamily] = shuffle(rng, FAMILY.spectra);
  if (!spicy) return [family.slice(0, count), afterFamily];
  const [hot, afterSpicy] = shuffle(afterFamily, SPICY.spectra);
  const fromSpicy = Math.min(hot.length, Math.ceil(count / 2));
  const mixed = [...hot.slice(0, fromSpicy), ...family.slice(0, count - fromSpicy)];
  return shuffle(afterSpicy, mixed);
}
