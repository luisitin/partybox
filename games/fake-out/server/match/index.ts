// The typed-answer matcher Fake-Out needs (Part 00 §4.4–4.6 with the audit's errata #16, #29 and
// the owner's ruling 16): canonicalising stems, rejects that also block stem and fuzzy matches,
// digits that never fuzz, OSA distance taken as the minimum over the answer and every accept.
// STAND-IN for @partybox/game-sdk/match (F5) — swap the import when F5 lands on main
// (docs/game-pack/fake-out/NOTES.md). Pure and locale-free.
import { normalize } from './normalize';
import type { MatchLang } from './normalize';

export { compact, normalize } from './normalize';
export type { MatchLang, Normalized } from './normalize';

export type MatchLevel = 'exact' | 'stem' | 'fuzzy' | 'none';

export interface AnswerItem {
  answer: string;
  accept?: readonly string[];
  reject?: readonly string[];
}

const SIBILANT = /(s|x|z|ch|sh)es$/;

/** One word's light stem (English), canonicalised so singular and plural meet:
 *  movies/movie → movi, horses/horse → hors, knives/knife → knif, berries/berry → berri. */
function stemEn(word: string): string {
  let w = word;
  if (w.length >= 4 && w.endsWith('ies')) w = `${w.slice(0, -3)}i`;
  else if (w.endsWith('ves') && w.length - 3 >= 3) w = `${w.slice(0, -3)}f`;
  else if (w.length >= 4 && SIBILANT.test(w)) w = w.slice(0, -2);
  else if (w.length >= 4 && w.endsWith('s') && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  if (w.length >= 3 && w.endsWith('e')) w = w.slice(0, -1); // pie/pies → pi, toe/toes → to
  if (w.length >= 3 && w.endsWith('y')) w = `${w.slice(0, -1)}i`;
  return w;
}

/** One word's light stem (Spanish): luces → luz, flores → flor, casas → casa → cas. */
function stemEs(word: string): string {
  let w = word;
  if (w.length >= 5 && w.endsWith('ces')) w = `${w.slice(0, -3)}z`;
  else if (w.length >= 5 && /[^aeiou]es$/.test(w)) w = w.slice(0, -2);
  else if (w.length >= 4 && w.endsWith('s')) w = w.slice(0, -1);
  if (w.length >= 4 && w.endsWith('e')) w = w.slice(0, -1);
  return w;
}

function stemsOfNorm(norm: string, lang: MatchLang): string {
  const stem = lang === 'es' ? stemEs : stemEn;
  return norm
    .split(' ')
    .map((w) => (/\d/.test(w) ? w : stem(w)))
    .join('');
}

/** Stems every word of normalized text; digits pass through. Returned compact (no spaces). */
export function stems(text: string, lang: MatchLang = 'en'): string {
  return stemsOfNorm(normalize(text, lang).norm, lang);
}

/** A text normalized once, for many comparisons (normalize dominates the matcher's cost). */
export interface Prepared {
  compact: string;
  stems: string;
  digits: boolean;
}

export function prepare(text: string, lang: MatchLang = 'en'): Prepared {
  const { norm, compact } = normalize(text, lang);
  return { compact, stems: stemsOfNorm(norm, lang), digits: /\d/.test(compact) };
}

/** An answer item's forms and rejects, prepared once. */
export interface PreparedItem {
  forms: Prepared[];
  rejects: Prepared[];
}

export function prepareItem(item: AnswerItem, lang: MatchLang = 'en'): PreparedItem {
  return {
    forms: [item.answer, ...(item.accept ?? [])]
      .map((f) => prepare(f, lang))
      .filter((f) => f.compact.length > 0),
    rejects: (item.reject ?? []).map((r) => prepare(r, lang)),
  };
}

/** Optimal-string-alignment distance (Damerau–Levenshtein without repeated edits). */
export function osa(a: string, b: string): number {
  const w = b.length + 1;
  const d = new Array<number>((a.length + 1) * w).fill(0);
  const at = (i: number, j: number): number => d[i * w + j] ?? 0;
  for (let i = 0; i <= a.length; i++) d[i * w] = i;
  for (let j = 0; j <= b.length; j++) d[j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        best = Math.min(best, at(i - 2, j - 2) + 1);
      d[i * w + j] = best;
    }
  return at(a.length, b.length);
}

/** Edits a fuzzy match may use against a target of this (compact) length (§4.5 step 4). */
export function allowance(length: number): number {
  if (length <= 4) return 0;
  if (length <= 7) return 1;
  if (length <= 11) return 2;
  return 3;
}

function minDistance(input: string, targets: readonly string[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (const t of targets) best = Math.min(best, osa(input, t));
  return best;
}

/** How well a prepared input matches a prepared item (§4.5): reject → none; exact; stem; fuzzy. */
export function matchPrepared(input: Prepared, item: PreparedItem): MatchLevel {
  const c = input.compact;
  if (c.length === 0) return 'none';
  if (item.rejects.some((r) => r.compact === c || r.stems === input.stems)) return 'none';
  if (item.forms.some((f) => f.compact === c)) return 'exact';
  if (item.forms.some((f) => f.stems === input.stems)) return 'stem';
  if (input.digits) return 'none'; // digits never fuzz (1984 vs 1985)
  const fuzzyTargets = item.forms
    .map((f) => f.compact)
    .filter((t) => !/\d/.test(t) && Math.abs(t.length - c.length) <= allowance(t.length))
    .filter((t) => osa(c, t) <= allowance(t.length));
  if (fuzzyTargets.length === 0) return 'none';
  const toTarget = minDistance(c, fuzzyTargets);
  const rejectCompacts = item.rejects.map((r) => r.compact);
  if (rejectCompacts.length > 0 && minDistance(c, rejectCompacts) <= toTarget) return 'none';
  return 'fuzzy';
}

export function matchAnswer(input: string, item: AnswerItem, lang: MatchLang = 'en'): MatchLevel {
  return matchPrepared(prepare(input, lang), prepareItem(item, lang));
}

/** Same answer, prepared (§4.6): compact equal, stems equal, or both at least 6 letters and one
 *  edit apart (never across digits). */
export function samePrepared(a: Prepared, b: Prepared): boolean {
  if (a.compact.length === 0 || b.compact.length === 0) return false;
  if (a.compact === b.compact || a.stems === b.stems) return true;
  if (a.digits || b.digits) return false;
  const la = a.compact.length;
  const lb = b.compact.length;
  return la >= 6 && lb >= 6 && Math.abs(la - lb) <= 1 && osa(a.compact, b.compact) === 1;
}

/** True when two players' texts are the same answer (§4.6). */
export function sameAnswer(a: string, b: string, lang: MatchLang = 'en'): boolean {
  return samePrepared(prepare(a, lang), prepare(b, lang));
}

/** Levels at or above `min` (exact > stem > fuzzy > none). */
export function atLeast(level: MatchLevel, min: MatchLevel): boolean {
  const order: MatchLevel[] = ['none', 'fuzzy', 'stem', 'exact'];
  return order.indexOf(level) >= order.indexOf(min);
}
