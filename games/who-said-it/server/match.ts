// STAND-IN for the foundation's `@partybox/game-sdk/match` (F5, P3) until it lands on main — see
// docs/game-pack/who-said-it/NOTES.md. Who Said It needs one function from it: `sameAnswer`, to
// merge two players' identical answers into one card (SPEC §4.6). Same rules as foundation §4.3–4.6
// with the audit's errata (#15 articles before numbers — numbers are skipped here, #16 stems that
// canonicalise, #25 quotes before NFKD, #26 the fold table). Pure and locale-free.

const QUOTES = /['’‘ʼ´`"“”]/g;
const FOLD: Readonly<Record<string, string>> = {
  ß: 'ss',
  ø: 'o',
  æ: 'ae',
  œ: 'oe',
  ł: 'l',
  đ: 'd',
  þ: 'th',
  ı: 'i',
};
const ARTICLES: Readonly<Record<string, readonly string[]>> = {
  en: ['the', 'a', 'an'],
  es: ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'],
};

export interface Normalized {
  norm: string;
  compact: string;
}

export function normalize(text: string, lang: 'en' | 'es' = 'en'): Normalized {
  let t = text.replace(QUOTES, '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
  t = [...t].map((c) => FOLD[c] ?? c).join('');
  t = t.replace(/&/g, lang === 'es' ? ' y ' : ' and ').replace(/\+/g, ' plus ');
  t = t.replace(/[-_/.,]/g, ' ').replace(/[^\p{L}\p{N} ]/gu, ' ');
  const words = t.split(' ').filter(Boolean);
  if (words.length > 1 && ARTICLES[lang]?.includes(words[0] as string)) words.shift();
  const norm = words.join(' ');
  return { norm, compact: norm.replace(/ /g, '') };
}

/** One word's canonical stem (audit #16): plural endings off, then a final e, y → i. */
function stemWord(word: string, lang: 'en' | 'es'): string {
  let w = word;
  if (/\d/.test(w)) return w;
  if (lang === 'es') {
    if (w.endsWith('ces')) w = `${w.slice(0, -3)}z`;
    else if (/[^aeiou]es$/.test(w)) w = w.slice(0, -2);
    else if (w.endsWith('s') && w.length > 3) w = w.slice(0, -1);
    return w.endsWith('e') && w.length > 3 ? w.slice(0, -1) : w;
  }
  if (w.endsWith('ies') && w.length > 4) w = `${w.slice(0, -3)}i`;
  else if (w.endsWith('ves') && w.length > 5) w = `${w.slice(0, -3)}f`;
  else if (/(s|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
  else if (w.endsWith('s') && !/(ss|us|is)$/.test(w) && w.length > 3) w = w.slice(0, -1);
  if (w.endsWith('e') && w.length > 3) w = w.slice(0, -1);
  if (w.endsWith('y') && w.length > 2) w = `${w.slice(0, -1)}i`;
  return w;
}

export function stem(norm: string, lang: 'en' | 'es' = 'en'): string {
  return norm
    .split(' ')
    .filter(Boolean)
    .map((w) => stemWord(w, lang))
    .join(' ');
}

/** Optimal-string-alignment distance (Damerau–Levenshtein with adjacent swaps). */
export function osaDistance(a: string, b: string): number {
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i += 1) rows.push([i]);
  for (let j = 1; j <= b.length; j += 1) (rows[0] as number[])[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    const row = rows[i] as number[];
    const up = rows[i - 1] as number[];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(
        (up[j] as number) + 1,
        (row[j - 1] as number) + 1,
        (up[j - 1] as number) + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d = Math.min(d, ((rows[i - 2] as number[])[j - 2] as number) + 1);
      row[j] = d;
    }
  }
  return (rows[a.length] as number[])[b.length] as number;
}

/** Two players typed the same thing (foundation §4.6): equal compact forms, equal stems, or both
 *  6+ letters and one edit apart. Digits never fuzz (ruling 16). */
export function sameAnswer(a: string, b: string, lang: 'en' | 'es' = 'en'): boolean {
  const na = normalize(a, lang);
  const nb = normalize(b, lang);
  if (na.compact.length === 0 || nb.compact.length === 0) return false;
  if (na.compact === nb.compact) return true;
  if (stem(na.norm, lang).replace(/ /g, '') === stem(nb.norm, lang).replace(/ /g, '')) return true;
  if (/\d/.test(na.compact) || /\d/.test(nb.compact)) return false;
  return (
    na.compact.length >= 6 && nb.compact.length >= 6 && osaDistance(na.compact, nb.compact) <= 1
  );
}
