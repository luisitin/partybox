// Echo's word packs, host-only (foundation §2.5): `init` draws the deck and the spares; nothing
// else of the pack ever enters state or a view. Parsed once at import, so a broken pack fails fast.
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { wordPackSchema } from '../content/schema';
import type { WordItem } from '../content/schema';
import familyJson from '../content/family.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };
import { normalize, stemCompact } from './match/index';

export const FAMILY: readonly WordItem[] = wordPackSchema.parse(familyJson).words;
export const SPICY: readonly WordItem[] = wordPackSchema.parse(spicyJson).words;
export const PACK_LANG = 'en' as const;

/** The words a game may draw: the family pack (plus spicy when on), limited to the ticked
 *  categories — nothing ticked, or a pick that leaves too few words, plays every category. */
export function pool(categories: readonly string[], spicy: boolean, need: number): WordItem[] {
  const all = spicy ? [...FAMILY, ...SPICY] : [...FAMILY];
  if (categories.length === 0) return all;
  const picked = all.filter((w) => categories.includes(w.category));
  return picked.length >= need ? picked : all;
}

/** The deck plus the spares for "Don't know it" swaps, drawn without repeats. */
export function drawWords(
  rng: RngState,
  categories: readonly string[],
  spicy: boolean,
  words: number,
  spares: number,
): [WordItem[], WordItem[], RngState] {
  const [shuffled, next] = shuffle(rng, pool(categories, spicy, words + spares));
  return [shuffled.slice(0, words), shuffled.slice(words, words + spares), next];
}

// ── Bot guesser index: bank clue (normalized) → the words whose bank holds it ────────────────
function keysOf(text: string): string[] {
  const c = normalize(text, PACK_LANG).compact;
  const s = stemCompact(text, PACK_LANG);
  return c === s ? [c] : [c, s];
}

function buildIndex(words: readonly WordItem[]): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const w of words)
    for (const clue of w.clues)
      for (const k of keysOf(clue)) {
        const list = index.get(k) ?? [];
        if (!list.includes(w.id)) list.push(w.id);
        index.set(k, list);
      }
  return index;
}

const FAMILY_INDEX = buildIndex(FAMILY);
const ALL_INDEX = buildIndex([...FAMILY, ...SPICY]);
const BY_ID = new Map([...FAMILY, ...SPICY].map((w) => [w.id, w]));

export function wordById(id: string): WordItem | undefined {
  return BY_ID.get(id);
}

/**
 * §7.11: every word in the pack ranked by how many of `clues` appear in its bank. Returns
 * [wordId, hits] best first; ties keep pack order (deterministic).
 */
export function rankByClues(clues: readonly string[], spicy: boolean): [string, number][] {
  const index = spicy ? ALL_INDEX : FAMILY_INDEX;
  const hits = new Map<string, number>();
  for (const clue of clues) {
    const ids = new Set(keysOf(clue).flatMap((k) => index.get(k) ?? []));
    for (const id of ids) hits.set(id, (hits.get(id) ?? 0) + 1);
  }
  return [...hits.entries()].sort((a, b) => b[1] - a[1]);
}
