// Typed access to content/*.json: the caller's nickname for every number. Parsed once at module
// load; a broken pack fails fast at import time (and in the contract suite).
import { callsPackSchema } from '../content/schema';
import familyJson from '../content/calls.json' with { type: 'json' };
import spicyJson from '../content/calls-spicy.json' with { type: 'json' };

const FAMILY = callsPackSchema.parse(familyJson);
const SPICY = callsPackSchema.parse(spicyJson);

const familyByNumber: Readonly<Record<number, string>> = Object.fromEntries(
  FAMILY.calls.map((c) => [c.number, c.call]),
);
const spicyByNumber: Readonly<Record<number, string>> = Object.fromEntries(
  SPICY.calls.map((c) => [c.number, c.call]),
);

/** I-129 B: whose line this is — the cheeky pack only where it overrides the family call. */
export function callPackFor(number: number, spicy: boolean): 'family' | 'cheeky' {
  return spicy && spicyByNumber[number] !== undefined ? 'cheeky' : 'family';
}

/** The spicy override when `spicy` and one exists, else the family call. Never empty. */
export function callFor(number: number, spicy: boolean): string {
  return (spicy ? spicyByNumber[number] : undefined) ?? familyByNumber[number] ?? String(number);
}
