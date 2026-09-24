// LOCAL STAND-IN for @partybox/game-sdk/match (Foundation F5). Part 00 §4.4–4.7 as amended by
// FOUNDATION-AUDIT #14, #16, #29–31 and ruling 16 (rejects block stem + fuzzy, digits never fuzz,
// a hyphenated clue is one word). Every function takes `lang` explicitly (audit #14).
import { normalize } from './normalize';
import type { Lang } from './normalize';

export { normalize } from './normalize';
export type { Lang, Normalized } from './normalize';

export interface AnswerItem {
  answer: string;
  accept?: readonly string[];
  reject?: readonly string[];
  family?: readonly string[];
}

export type MatchLevel = 'exact' | 'stem' | 'fuzzy' | 'none';

/** Canonicalising light stemmer (audit #16): movies/movie, horses/horse, knives/knife meet. */
export function stemWord(word: string, lang: Lang): string {
  let w = word;
  if (/^\d+$/.test(w) || w.length <= 2) return w;
  if (lang === 'en') {
    if (w.endsWith('ies') && w.length > 4) w = `${w.slice(0, -3)}i`;
    else if (w.endsWith('ves') && w.length - 3 >= 3) w = `${w.slice(0, -3)}f`;
    else if (/(s|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
    else if (w.endsWith('s') && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
    if (w.endsWith('e') && w.length > 3) w = w.slice(0, -1);
    if (w.endsWith('y') && w.length > 3) w = `${w.slice(0, -1)}i`;
    return w;
  }
  if (w.endsWith('ces')) w = `${w.slice(0, -3)}z`;
  else if (/[^aeiou]es$/.test(w)) w = w.slice(0, -2);
  else if (w.endsWith('s')) w = w.slice(0, -1);
  if (w.endsWith('e') && w.length > 3) w = w.slice(0, -1);
  return w;
}

/** Stem every word of the normalized text, then compact. */
export function stemCompact(text: string, lang: Lang): string {
  const { norm } = normalize(text, lang);
  return norm
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => stemWord(w, lang))
    .join('');
}

/** Optimal-string-alignment (restricted Damerau–Levenshtein) distance. */
export function osa(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev2: number[] = [];
  let prev: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur: number[] = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(
        (prev[j] as number) + 1,
        (cur[j - 1] as number) + 1,
        (prev[j - 1] as number) + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        v = Math.min(v, (prev2[j - 2] as number) + 1);
      cur.push(v);
    }
    prev2 = prev;
    prev = cur;
  }
  return prev[n] as number;
}

function allowance(len: number): number {
  if (len <= 4) return 0;
  if (len <= 7) return 1;
  if (len <= 11) return 2;
  return 3;
}

const HAS_DIGIT = /\d/;

export function matchAnswer(input: string, item: AnswerItem, lang: Lang): MatchLevel {
  const c = normalize(input, lang).compact;
  if (c.length === 0) return 'none';
  const st = stemCompact(input, lang);
  const targets = [item.answer, ...(item.accept ?? [])];
  const rejects = item.reject ?? [];
  // 1. Rejects block by compact form and by stem (audit #29).
  for (const r of rejects)
    if (normalize(r, lang).compact === c || stemCompact(r, lang) === st) return 'none';
  // 2. Exact.
  for (const t of targets) if (normalize(t, lang).compact === c) return 'exact';
  // 3. Stem.
  for (const t of targets) if (stemCompact(t, lang) === st) return 'stem';
  // 4. Fuzzy: min OSA over answer + accepts; digits never fuzz; blocked when a reject is as close.
  if (HAS_DIGIT.test(c)) return 'none';
  let best = Number.POSITIVE_INFINITY;
  for (const t of targets) {
    const tc = normalize(t, lang).compact;
    if (HAS_DIGIT.test(tc)) continue;
    const d = osa(c, tc);
    if (d <= allowance(tc.length) && d < best) best = d;
  }
  if (!Number.isFinite(best)) return 'none';
  for (const r of rejects) if (osa(c, normalize(r, lang).compact) <= best) return 'none';
  return 'fuzzy';
}

/** One player's text against another's (§4.6). */
export function sameAnswer(a: string, b: string, lang: Lang): boolean {
  const ca = normalize(a, lang).compact;
  const cb = normalize(b, lang).compact;
  if (ca.length === 0 || cb.length === 0) return false;
  if (ca === cb) return true;
  if (stemCompact(a, lang) === stemCompact(b, lang)) return true;
  if (HAS_DIGIT.test(ca) || HAS_DIGIT.test(cb)) return false;
  return ca.length >= 6 && cb.length >= 6 && osa(ca, cb) <= 1;
}

/**
 * Group texts that are the same answer (audit #30): union-find in stable submission order, so the
 * result never depends on locale or object key order. Returns groups of input indices, each
 * sorted ascending, ordered by their first index.
 */
export function groupAnswers(texts: readonly string[], lang: Lang): number[][] {
  const parent = texts.map((_, i) => i);
  const find = (i: number): number => {
    let r = i;
    while (parent[r] !== r) r = parent[r] as number;
    return r;
  };
  for (let i = 0; i < texts.length; i++)
    for (let j = i + 1; j < texts.length; j++)
      if (sameAnswer(texts[i] as string, texts[j] as string, lang)) {
        const a = find(i);
        const b = find(j);
        if (a !== b) parent[Math.max(a, b)] = Math.min(a, b);
      }
  const groups = new Map<number, number[]>();
  for (let i = 0; i < texts.length; i++) {
    const r = find(i);
    const g = groups.get(r) ?? [];
    g.push(i);
    groups.set(r, g);
  }
  return [...groups.values()].sort((x, y) => (x[0] as number) - (y[0] as number));
}

export type ClueReason = 'empty' | 'too-long' | 'not-one-word' | 'is-secret' | 'contains-secret';
export type ClueCheck = { ok: true } | { ok: false; reason: ClueReason };

export interface ClueOpts {
  oneWord?: boolean;
  maxChars?: number;
}

/** §4.7 with audit #31: length on the raw trimmed text in code points; hyphens keep one word. */
export function isLegalClue(
  clue: string,
  secret: AnswerItem,
  lang: Lang,
  opts: ClueOpts = {},
): ClueCheck {
  const raw = clue.trim();
  const { compact } = normalize(raw, lang);
  if (compact.length === 0) return { ok: false, reason: 'empty' };
  if ([...raw].length > (opts.maxChars ?? 20)) return { ok: false, reason: 'too-long' };
  if (opts.oneWord && /\s/.test(raw)) return { ok: false, reason: 'not-one-word' };
  const level = matchAnswer(raw, { ...secret, reject: [] }, lang);
  if (level === 'exact' || level === 'stem') return { ok: false, reason: 'is-secret' };
  // Containment is against the secret itself and its family roots (§4.7), not every accept:
  // "honey" stays a fair clue for "bee" although "honeybee" counts as a right guess.
  const sc = normalize(secret.answer, lang).compact;
  if (sc.length >= 3 && compact.includes(sc)) return { ok: false, reason: 'contains-secret' };
  if (compact.length >= 4 && sc.includes(compact)) return { ok: false, reason: 'contains-secret' };
  const roots = (secret.family ?? [])
    .map((f) => normalize(f, lang).compact)
    .filter((f) => f.length >= 3);
  for (const r of roots) if (compact.includes(r)) return { ok: false, reason: 'contains-secret' };
  return { ok: true };
}
