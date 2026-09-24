// A thin local stand-in for the shared matcher (foundation §4.3–4.6, F5), cut to what Tune In
// needs: normalize, stem and sameAnswer in English (the packs are `lang: 'en'`). Swap to
// `@partybox/game-sdk/match` when F5 lands (docs/game-pack/tune-in/NOTES.md). Pure, no imports and
// no locale APIs, so the phone can run the same clue check as the server.

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
const ARTICLES = new Set(['the', 'a', 'an']);
const UNITS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** Number words up to ninety-nine become digits ("twenty one" → "21"); tokens are already split. */
function numbersToDigits(words: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i] as string;
    const tens = TENS.indexOf(word);
    if (tens >= 2) {
      const unit = UNITS.indexOf(words[i + 1] ?? '');
      if (unit >= 1 && unit <= 9) {
        out.push(String(tens * 10 + unit));
        i += 1;
      } else out.push(String(tens * 10));
      continue;
    }
    const unit = UNITS.indexOf(word);
    out.push(unit >= 0 ? String(unit) : word);
  }
  return out;
}

export interface Normalized {
  norm: string;
  compact: string;
  words: string[];
}

/** Foundation §4.3 with the audit's errata (#15, #25–27): quotes go before NFKD, a fold table for
 *  letters NFKD keeps, the article is dropped before numbers and only when a word follows. */
export function normalize(text: string): Normalized {
  let t = text.replace(QUOTES, '');
  t = t.normalize('NFKD').replace(/\p{M}/gu, '');
  t = t.toLowerCase();
  t = t.replace(/[ßøæœłđþı]/g, (c) => FOLD[c] ?? c);
  t = t.replace(/&/g, ' and ').replace(/\+/g, ' plus ');
  t = t.replace(/[-_/.,]/g, ' ');
  t = t.replace(/[^\p{L}\p{N}\s]/gu, '');
  let words = t.split(/\s+/).filter((w) => w.length > 0);
  if (words.length > 1 && ARTICLES.has(words[0] as string)) words = words.slice(1);
  words = numbersToDigits(words);
  return { norm: words.join(' '), compact: words.join(''), words };
}

/** Foundation §4.4 as the audit canonicalises it (#16): ies→i, ves→f, es after a sibilant, s,
 *  then a final e dropped and y→i, so movie/movies, horse/horses and berry/berries meet. */
export function stem(word: string): string {
  let w = word;
  if (w.length > 4 && w.endsWith('ies')) w = `${w.slice(0, -3)}i`;
  else if (w.endsWith('ves') && w.length - 3 >= 3) w = `${w.slice(0, -3)}f`;
  else if (w.endsWith('es') && /(s|x|z|ch|sh)$/.test(w.slice(0, -2))) w = w.slice(0, -2);
  else if (w.endsWith('s') && !/(ss|us|is)$/.test(w) && w.length > 3) w = w.slice(0, -1);
  if (w.length > 3 && w.endsWith('e')) w = w.slice(0, -1);
  if (w.length > 2 && w.endsWith('y')) w = `${w.slice(0, -1)}i`;
  return w;
}

/** Optimal-string-alignment distance, capped: returns `cap + 1` as soon as it is exceeded. */
function osa(a: string, b: string, cap: number): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i += 1) {
    const row: number[] = [i];
    for (let j = 1; j <= b.length; j += 1) {
      if (i === 0) {
        row.push(j);
        continue;
      }
      const prev = rows[i - 1] as number[];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min((prev[j] as number) + 1, (row[j - 1] as number) + 1);
      best = Math.min(best, (prev[j - 1] as number) + cost);
      const twoBack = rows[i - 2];
      if (twoBack && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        best = Math.min(best, (twoBack[j - 2] as number) + 1);
      row.push(best);
    }
    rows.push(row);
  }
  return (rows[a.length] as number[])[b.length] as number;
}

/** Foundation §4.6: equal compact forms, equal stems, or both ≥ 6 letters and one edit apart
 *  (digits never fuzz — audit #29). */
export function sameAnswer(a: string, b: string): boolean {
  const x = normalize(a);
  const y = normalize(b);
  if (x.compact.length === 0 || y.compact.length === 0) return false;
  if (x.compact === y.compact) return true;
  if (x.words.map(stem).join(' ') === y.words.map(stem).join(' ')) return true;
  if (/\d/.test(x.compact) || /\d/.test(y.compact)) return false;
  return x.compact.length >= 6 && y.compact.length >= 6 && osa(x.compact, y.compact, 1) <= 1;
}
