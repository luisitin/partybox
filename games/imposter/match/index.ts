// STAND-IN for @partybox/game-sdk/match (foundation F5, P3) — the same names and signatures the
// SDK module will export, so the swap is an import change. Part 00 §4.5–4.7 with the owner's
// ruling 16 (rejects also block stem and fuzzy; digits never fuzz; a hyphenated clue is one word)
// and audit #29/#31 (OSA distance, min over answer + accepts; raw length in code points).
import { normalize, stem, stemCompact } from './normalize';
import type { MatchLang } from './normalize';

export { normalize, stem } from './normalize';
export type { MatchLang, Normalized } from './normalize';

/** Anything a player might type (Part 00 §4.2). */
export interface AnswerItem {
  id: string;
  answer: string;
  accept?: readonly string[];
  reject?: readonly string[];
  family?: readonly string[];
}

export type MatchLevel = 'exact' | 'stem' | 'fuzzy' | 'none';
const LEVEL_RANK: Record<MatchLevel, number> = { exact: 3, stem: 2, fuzzy: 1, none: 0 };

/** True when `level` is `atLeast` or better. */
export function atLeast(level: MatchLevel, bar: MatchLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[bar];
}

/** Optimal string alignment distance (Damerau–Levenshtein without repeated edits of a substring). */
export function osa(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev2: number[] = [];
  let prev: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const row = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        v = Math.min(v, (prev2[j - 2] ?? 0) + 1);
      row.push(v);
    }
    prev2 = prev;
    prev = row;
  }
  return prev[n] ?? 0;
}

function allowance(len: number): number {
  if (len <= 4) return 0;
  if (len <= 7) return 1;
  if (len <= 11) return 2;
  return 3;
}

const compactOf = (t: string, lang: MatchLang): string => normalize(t, lang).compact;

/** Part 00 §4.5 as amended. */
export function matchAnswer(input: string, item: AnswerItem, lang: MatchLang = 'en'): MatchLevel {
  const c = compactOf(input, lang);
  if (c.length === 0) return 'none';
  const s = stemCompact(input, lang);
  const rejects = item.reject ?? [];
  if (rejects.some((r) => compactOf(r, lang) === c || stemCompact(r, lang) === s)) return 'none';
  const targets = [item.answer, ...(item.accept ?? [])];
  if (targets.some((t) => compactOf(t, lang) === c)) return 'exact';
  if (targets.some((t) => stemCompact(t, lang) === s)) return 'stem';
  if (/\d/.test(c)) return 'none'; // digits never fuzz (1984 vs 1985)
  let best = Infinity;
  for (const t of targets) {
    const tc = compactOf(t, lang);
    const d = osa(c, tc);
    if (d <= allowance(tc.length)) best = Math.min(best, d);
  }
  if (best === Infinity) return 'none';
  // A reject at least as close as the target blocks the fuzzy hit ("hose" for horse).
  if (rejects.some((r) => osa(c, compactOf(r, lang)) <= best)) return 'none';
  return 'fuzzy';
}

/** Part 00 §4.6: one player's text against another's. */
export function sameAnswer(a: string, b: string, lang: MatchLang = 'en'): boolean {
  const ca = compactOf(a, lang);
  const cb = compactOf(b, lang);
  if (ca.length === 0 || cb.length === 0) return false;
  if (ca === cb) return true;
  if (stemCompact(a, lang) === stemCompact(b, lang)) return true;
  return ca.length >= 6 && cb.length >= 6 && !/\d/.test(ca + cb) && osa(ca, cb) <= 1;
}

export type ClueReason = 'empty' | 'too-long' | 'not-one-word' | 'is-secret' | 'contains-secret';
export type ClueVerdict = { ok: true } | { ok: false; reason: ClueReason };

export interface ClueOptions {
  oneWord?: boolean;
  maxChars?: number;
  lang?: MatchLang;
}

/**
 * Part 00 §4.7 as amended (#31): length is the raw trimmed text in code points; `oneWord` splits
 * the raw text on whitespace, so "ice-cream" is one word. Never call this for a player who does
 * not know the secret — the reason itself would leak it.
 */
export function isLegalClue(clue: string, secret: AnswerItem, opts: ClueOptions = {}): ClueVerdict {
  const lang = opts.lang ?? 'en';
  const maxChars = opts.maxChars ?? 20;
  const raw = clue.trim();
  const c = compactOf(raw, lang);
  if (c.length === 0) return { ok: false, reason: 'empty' };
  if ([...raw].length > maxChars) return { ok: false, reason: 'too-long' };
  if (opts.oneWord && raw.split(/\s+/).length > 1) return { ok: false, reason: 'not-one-word' };
  if (atLeast(matchAnswer(raw, secret, lang), 'stem')) return { ok: false, reason: 'is-secret' };
  const secretForms = [secret.answer, ...(secret.accept ?? [])].map((t) => compactOf(t, lang));
  const roots = (secret.family ?? []).map((f) => compactOf(f, lang)).filter((f) => f.length >= 3);
  const answer = compactOf(secret.answer, lang);
  if (
    secretForms.some((f) => f.length >= 3 && c.includes(f)) ||
    roots.some((r) => c.includes(r)) ||
    (c.length >= 4 && answer.includes(c)) ||
    (stem(c, lang).length >= 4 && answer.includes(stem(c, lang)))
  )
    return { ok: false, reason: 'contains-secret' };
  return { ok: true };
}
