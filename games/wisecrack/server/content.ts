// Typed access to content/*.json. Content is imported statically (bundled, no I/O at runtime) and
// parsed once at module load, so a broken pack fails at import time and in the contract suite.
import {
  familyEsPackSchema,
  familyPackSchema,
  spicyEsPackSchema,
  spicyPackSchema,
} from '../content/schema';
import type { FamilyPack, Prompt, SpicyPack } from '../content/schema';
import familyEsJson from '../content/family.es.json' with { type: 'json' };
import familyJson from '../content/family.json' with { type: 'json' };
import spicyEsJson from '../content/spicy.es.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };

export type ContentLang = 'en' | 'es';

export const FAMILY: FamilyPack = familyPackSchema.parse(familyJson);
export const SPICY: SpicyPack = spicyPackSchema.parse(spicyJson);
/** ADR-054: the Spanish packs, same ids as the English ones. */
export const FAMILY_ES: FamilyPack = familyEsPackSchema.parse(familyEsJson);
export const SPICY_ES: SpicyPack = spicyEsPackSchema.parse(spicyEsJson);

const byId = (prompts: Prompt[]): Readonly<Record<string, Prompt>> =>
  Object.fromEntries(prompts.map((p) => [p.id, p]));
const BY_ID = byId([...FAMILY.prompts, ...SPICY.prompts]);
const BY_ID_ES = byId([...FAMILY_ES.prompts, ...SPICY_ES.prompts]);

/** The bots' answers in the game's content language. */
export function botAnswers(lang: ContentLang | undefined): readonly string[] {
  return lang === 'es' ? FAMILY_ES.botAnswers : FAMILY.botAnswers;
}

/** Every prompt id a game may draw from; the spicy pack is mixed in only when the setting is on. */
export function promptPool(spicy: boolean): string[] {
  const ids = FAMILY.prompts.map((p) => p.id);
  return spicy ? [...ids, ...SPICY.prompts.map((p) => p.id)] : ids;
}

/** Text for a prompt id; a fixture with an unknown id still renders (reduce/views stay total). */
export function promptText(id: string, lang?: ContentLang): string {
  return (lang === 'es' ? BY_ID_ES : BY_ID)[id]?.text ?? '(missing prompt)';
}
