// Typed access to the host-only packs (SPEC §1.14). Only what `init` and the last chance draw ever
// enters state; bots read the banks here the way a person uses general knowledge (SPEC §1.9).
import { nextInt, shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { normalize } from '../match';
import { pronunciationsSchema, wordPackSchema } from '../content/schema';
import type { Category, WordItem } from '../content/schema';
import familyJson from '../content/family.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };
import type { Cfg, DrawnWord } from './types';

export const FAMILY = wordPackSchema.parse(familyJson);
export const SPICY = wordPackSchema.parse(spicyJson);
export const PRONUNCIATIONS = pronunciationsSchema.parse(pronunciationsJson);
export const PACK_LANG = FAMILY.lang;

const ALL: readonly Category[] = [...FAMILY.categories, ...SPICY.categories];
const SPICY_IDS = new Set(SPICY.categories.map((c) => c.category));
const BY_CATEGORY = new Map(ALL.map((c) => [c.category, c]));
const BY_WORD = new Map<string, { word: WordItem; cat: Category }>();
for (const cat of ALL) for (const word of cat.words) BY_WORD.set(word.id, { word, cat });

export function isSpicyCategory(id: string): boolean {
  return SPICY_IDS.has(id);
}

/** The categories this game draws from: the picks, else every one the spicy switch allows. */
export function categoriesFor(cfg: Pick<Cfg, 'categories' | 'spicy'>): Category[] {
  const allowed = ALL.filter((c) => cfg.spicy || !SPICY_IDS.has(c.category));
  const picked = allowed.filter((c) => cfg.categories.includes(c.category));
  return picked.length > 0 ? picked : allowed;
}

export function categoryById(id: string): Category | undefined {
  return BY_CATEGORY.get(id);
}

/** The full pack entry (with its clue bank) for a drawn word id. */
export function wordById(id: string): WordItem | undefined {
  return BY_WORD.get(id)?.word;
}

/** The pack entry for a word a crew phone was dealt (what a crew bot "knows"). */
export function wordAnywhere(answer: string): WordItem | undefined {
  for (const cat of ALL) {
    const w = cat.words.find((x) => x.answer === answer);
    if (w) return w;
  }
  return undefined;
}

/** The pack entry whose answer is `answer` inside `category` (what a crew bot "knows"). */
export function wordByAnswer(category: string, answer: string): WordItem | undefined {
  return categoryById(category)?.words.find((w) => w.answer === answer);
}

function drawn(word: WordItem, cat: Category): DrawnWord {
  return {
    id: word.id,
    answer: word.answer,
    accept: word.accept,
    reject: word.reject,
    family: word.family,
    cat: cat.category,
    label: cat.label,
  };
}

/**
 * `count` distinct words, never two in a row from the same category (unless only one category is
 * in play), from a seeded shuffle.
 */
export function drawWords(
  rng: RngState,
  cats: readonly Category[],
  count: number,
): [DrawnWord[], RngState] {
  const pool = cats.flatMap((cat) => cat.words.map((word) => ({ word, cat })));
  const [order, next] = shuffle(rng, pool);
  const out: DrawnWord[] = [];
  const left = [...order];
  while (out.length < count && left.length > 0) {
    const prev = out[out.length - 1]?.cat;
    let i = left.findIndex((e) => e.cat.category !== prev);
    if (i < 0) i = 0;
    const [e] = left.splice(i, 1);
    if (e) out.push(drawn(e.word, e.cat));
  }
  return [out, next];
}

const compact = (t: string): string => normalize(t, PACK_LANG).compact;

/** True when two words share an accepted form or a family root (SPEC §1.14: never a decoy). */
export function sharesForm(a: Omit<WordItem, 'clues'>, b: Omit<WordItem, 'clues'>): boolean {
  const fa = new Set([a.answer, ...a.accept].map(compact));
  if ([b.answer, ...b.accept].some((f) => fa.has(compact(f)))) return true;
  const ra = new Set(a.family.map(compact));
  return b.family.some((f) => ra.has(compact(f)));
}

/** The last-chance options: the word plus 5 decoys from its category, shuffled (SPEC §1.14). */
export function drawOptions(rng: RngState, word: DrawnWord): [string[], RngState] {
  const cat = categoryById(word.cat);
  const fair = (cat?.words ?? []).filter((w) => w.id !== word.id && !sharesForm(word, w));
  const [decoys, r1] = shuffle(rng, fair);
  const options = [word.answer, ...decoys.slice(0, 5).map((w) => w.answer)];
  return shuffle(r1, options);
}

/** A seeded pick from a list (null when empty). */
export function pickFrom<T>(rng: RngState, list: readonly T[]): [T | null, RngState] {
  if (list.length === 0) return [null, rng];
  const [i, next] = nextInt(rng, 0, list.length - 1);
  return [list[i] ?? null, next];
}
