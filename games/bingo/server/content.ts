// Typed access to content/*.json: the caller's nickname for every number. Parsed once at module
// load; a broken pack fails fast at import time (and in the contract suite).
import { callsEsPackSchema, callsPackSchema } from '../content/schema';
import familyEsJson from '../content/calls.es.json' with { type: 'json' };
import familyJson from '../content/calls.json' with { type: 'json' };
import spicyEsJson from '../content/calls-spicy.es.json' with { type: 'json' };
import spicyJson from '../content/calls-spicy.json' with { type: 'json' };

export const FAMILY = callsPackSchema.parse(familyJson);
export const SPICY = callsPackSchema.parse(spicyJson);
/** ADR-054: the Spanish calls, one per English call (same numbers). */
export const FAMILY_ES = callsEsPackSchema.parse(familyEsJson);
export const SPICY_ES = callsEsPackSchema.parse(spicyEsJson);

type ByNumber = Readonly<Record<number, string>>;
const byNumber = (calls: readonly { number: number; call: string }[]): ByNumber =>
  Object.fromEntries(calls.map((c) => [c.number, c.call]));
const BY_LANG: Readonly<Record<'en' | 'es', { family: ByNumber; spicy: ByNumber }>> = {
  en: { family: byNumber(FAMILY.calls), spicy: byNumber(SPICY.calls) },
  es: { family: byNumber(FAMILY_ES.calls), spicy: byNumber(SPICY_ES.calls) },
};

/** The spicy override when `spicy` and one exists, else the family call, in the game's content
 *  language. Never empty. */
export function callFor(number: number, spicy: boolean, lang?: 'en' | 'es'): string {
  const { family, spicy: extra } = BY_LANG[lang === 'es' ? 'es' : 'en'];
  return (spicy ? extra[number] : undefined) ?? family[number] ?? String(number);
}
