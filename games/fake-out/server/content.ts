// Typed access to content/*.json (SPEC §3.15). Packs are imported statically and parsed once at
// module load, so a broken pack fails at import time and in the contract suite. Only the facts a
// game draws ever enter state (Part 00 §2.5); nothing here reaches a phone.
import {
  familyPackSchema,
  fillersPackSchema,
  pronunciationsPackSchema,
  spicyPackSchema,
} from '../content/schema';
import type { FactItem, FactPack, FillersPack, PronunciationsPack } from '../content/schema';
import familyJson from '../content/family.json' with { type: 'json' };
import fillersJson from '../content/fillers.json' with { type: 'json' };
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };

export const FAMILY: FactPack = familyPackSchema.parse(familyJson);
export const SPICY: FactPack = spicyPackSchema.parse(spicyJson);
export const FILLERS: FillersPack = fillersPackSchema.parse(fillersJson);
export const PRONUNCIATIONS: PronunciationsPack =
  pronunciationsPackSchema.parse(pronunciationsJson);

/** Every fact a game with these settings may draw, in pack order (the draw shuffles). Categories
 *  that leave fewer than `need` facts are topped up from the rest of the pool, so a narrow pick
 *  (or a spicy-only category with spicy off) still fills the game. */
export function factPool(spicy: boolean, categories: readonly string[], need: number): FactItem[] {
  const all = spicy ? [...FAMILY.facts, ...SPICY.facts] : FAMILY.facts;
  if (categories.length === 0) return all;
  const picked = all.filter((f) => categories.includes(f.category));
  if (picked.length >= need) return picked;
  return [...picked, ...all.filter((f) => !categories.includes(f.category))];
}

/** The bots' (and Suggest's) last resort for a fact: its kind's fillers, then its category's. */
export function fillersFor(item: FactItem): string[] {
  return [...(FILLERS.byKind[item.kind] ?? []), ...(FILLERS.byCategory[item.category] ?? [])];
}
