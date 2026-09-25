// STAND-IN for `@partybox/game-sdk/match` (Part 00 §4, platform request P3 / F5), which has not
// landed on main yet. Only what Spy Grid needs: normalize, stem, sameAnswer, isLegalClue — written to
// the audit's errata (#15, #16, #25–#27, #31, ruling 16) so the swap is a one-line import change.
// Pure and locale-free: no localeCompare / toLocale* / Intl. See docs/game-pack/spy-grid/NOTES.md.

export type Lang = 'en' | 'es';

const QUOTES = /['’‘ʼ´`"“”]/g;
const FOLD: Record<string, string> = {
  ß: 'ss',
  ø: 'o',
  æ: 'ae',
  œ: 'oe',
  ł: 'l',
  đ: 'd',
  þ: 'th',
  ı: 'i',
};
const ARTICLES: Record<Lang, readonly string[]> = {
  en: ['the', 'a', 'an'],
  es: ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'],
};

export interface Normalized {
  norm: string;
  compact: string;
}

/** Part 00 §4.3 as amended: quotes go before NFKD (#25), a fold table (#26), the article drops
 *  only when another word follows (#27). Number words are left alone: Spy Grid never needs them. */
export function normalize(text: string, lang: Lang): Normalized {
  let s = text.replace(QUOTES, '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
  s = s.replace(/[ßøæœłđþı]/g, (c) => FOLD[c] ?? c);
  s = s.replace(/&/g, lang === 'es' ? ' y ' : ' and ').replace(/\+/g, ' plus ');
  s = s.replace(/[-_/.,]/g, ' ').replace(/[^a-z0-9 ]/g, '');
  const words = s.split(' ').filter((w) => w.length > 0);
  if (words.length > 1 && ARTICLES[lang].includes(words[0] ?? '')) words.shift();
  const norm = words.join(' ');
  return { norm, compact: norm.replace(/ /g, '') };
}

/** One word, canonicalised so singular and plural meet (audit #16): movies/movie → movi,
 *  horses/horse → hors, knives/knife → knif. */
export function stemWord(word: string, lang: Lang): string {
  let w = word;
  if (lang === 'es') {
    if (w.endsWith('ces')) w = `${w.slice(0, -3)}z`;
    else if (/[^aeiou]es$/.test(w)) w = w.slice(0, -2);
    else if (w.endsWith('s') && w.length > 3) w = w.slice(0, -1);
    return w.length > 3 && w.endsWith('e') ? w.slice(0, -1) : w;
  }
  if (w.endsWith('ies') && w.length > 4) w = `${w.slice(0, -3)}i`;
  else if (w.endsWith('ves') && w.length > 5) w = `${w.slice(0, -3)}f`;
  else if (/(s|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
  else if (w.endsWith('s') && !/(ss|us|is)$/.test(w) && w.length > 3) w = w.slice(0, -1);
  if (w.length > 3 && w.endsWith('e')) w = w.slice(0, -1);
  if (w.length > 2 && w.endsWith('y')) w = `${w.slice(0, -1)}i`;
  return w;
}

export function stem(text: string, lang: Lang): string {
  return normalize(text, lang)
    .norm.split(' ')
    .map((w) => stemWord(w, lang))
    .join(' ');
}

/** Optimal string alignment distance (Damerau–Levenshtein without repeated edits). */
export function osa(a: string, b: string): number {
  const d: number[][] = [];
  for (let i = 0; i <= a.length; i++) d.push([i]);
  for (let j = 1; j <= b.length; j++) (d[0] as number[])[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const row = d[i] as number[];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const prev = d[i - 1] as number[];
      let v = Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        v = Math.min(v, ((d[i - 2] as number[])[j - 2] ?? 0) + 1);
      row[j] = v;
    }
  }
  return (d[a.length] as number[])[b.length] ?? 0;
}

/** Part 00 §4.6: same compact form, same stems, or both 6+ letters and one edit apart. */
export function sameAnswer(a: string, b: string, lang: Lang): boolean {
  const na = normalize(a, lang).compact;
  const nb = normalize(b, lang).compact;
  if (na.length === 0 || nb.length === 0) return false;
  if (na === nb || stem(a, lang) === stem(b, lang)) return true;
  return na.length >= 6 && nb.length >= 6 && osa(na, nb) === 1;
}

export interface Secret {
  answer: string;
  accept?: readonly string[];
  family?: readonly string[];
}

export type IllegalReason = 'empty' | 'too-long' | 'not-one-word' | 'is-secret' | 'contains-secret';
export type LegalResult = { ok: true } | { ok: false; reason: IllegalReason };

/** Part 00 §4.7 with audit #31: length on the raw trimmed text in code points; one word = no
 *  whitespace in the raw text (a hyphenated clue is one word). */
export function isLegalClue(
  clue: string,
  secret: Secret,
  opts: { lang: Lang; maxChars?: number; oneWord?: boolean },
): LegalResult {
  const raw = clue.trim();
  if ([...raw].length > (opts.maxChars ?? 20)) return { ok: false, reason: 'too-long' };
  const c = normalize(raw, opts.lang);
  if (c.compact.length === 0) return { ok: false, reason: 'empty' };
  if (opts.oneWord === true && /\s/.test(raw)) return { ok: false, reason: 'not-one-word' };
  const forms = [secret.answer, ...(secret.accept ?? [])];
  const clueStem = stem(raw, opts.lang).replace(/ /g, '');
  for (const f of forms) {
    const n = normalize(f, opts.lang).compact;
    if (n === c.compact || stem(f, opts.lang).replace(/ /g, '') === clueStem)
      return { ok: false, reason: 'is-secret' };
  }
  const target = normalize(secret.answer, opts.lang).compact;
  const roots = [target, ...(secret.family ?? []).map((r) => normalize(r, opts.lang).compact)];
  if (roots.some((r) => r.length >= 3 && c.compact.includes(r)))
    return { ok: false, reason: 'contains-secret' };
  if (c.compact.length >= 4 && roots.some((r) => r.includes(c.compact)))
    return { ok: false, reason: 'contains-secret' };
  return { ok: true };
}
