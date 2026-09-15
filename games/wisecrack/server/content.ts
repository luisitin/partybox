// Typed access to content/*.json. Content is imported statically (bundled, no I/O at runtime) and
// parsed once at module load, so a broken pack fails at import time and in the contract suite.
import { familyPackSchema, spicyPackSchema } from '../content/schema';
import type { FamilyPack, Prompt, SpicyPack } from '../content/schema';
import familyJson from '../content/family.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };

export const FAMILY: FamilyPack = familyPackSchema.parse(familyJson);
export const SPICY: SpicyPack = spicyPackSchema.parse(spicyJson);

const BY_ID: Readonly<Record<string, Prompt>> = Object.fromEntries(
  [...FAMILY.prompts, ...SPICY.prompts].map((p) => [p.id, p]),
);

/** Every prompt id a game may draw from; the spicy pack is mixed in only when the setting is on. */
export function promptPool(spicy: boolean): string[] {
  const ids = FAMILY.prompts.map((p) => p.id);
  return spicy ? [...ids, ...SPICY.prompts.map((p) => p.id)] : ids;
}

/** Text for a prompt id; a fixture with an unknown id still renders (reduce/views stay total). */
export function promptText(id: string): string {
  return BY_ID[id]?.text ?? '(missing prompt)';
}
