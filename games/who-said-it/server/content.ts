// Typed access to the packs. Host-only: the server imports them; no client file may (foundation
// §2.5). `init` draws just the prompts one game needs.
import { promptPackSchema, pronunciationsSchema } from '../content/schema';
import type { PackPrompt, Pronunciations } from '../content/schema';
import familyJson from '../content/family.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };

// Parsed once at module load; a broken pack fails fast at import time (and in the contract suite).
export const FAMILY: readonly PackPrompt[] = promptPackSchema.parse(familyJson).prompts;
export const SPICY: readonly PackPrompt[] = promptPackSchema.parse(spicyJson).prompts;
export const PRONUNCIATIONS: Pronunciations = pronunciationsSchema.parse(pronunciationsJson);

/** Every prompt a game may draw from: family, plus the spicy pack when it is on. */
export function promptPool(spicy: boolean): readonly PackPrompt[] {
  return spicy ? [...FAMILY, ...SPICY] : FAMILY;
}
