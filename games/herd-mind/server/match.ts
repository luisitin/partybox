// STAND-IN for `@partybox/game-sdk/match` (foundation F5, P3) until it lands on main — see
// docs/game-pack/herd-mind/NOTES.md. Follows Part 00 §4 as amended by the audit (#14–16, #25–31)
// and ruling 16: quotes stripped before NFKD, a fold table, the article dropped before number
// words and only when a word follows, canonicalising stems, rejects that also block stem and
// fuzzy, digits that never fuzz, OSA distance. Pure, no locale APIs, no imports.

export type Lang = 'en' | 'es';
export type MatchLevel = 'exact' | 'stem' | 'fuzzy' | 'none';
export interface MatchItem {
  answer: string;
  accept?: readonly string[];
  reject?: readonly string[];
}
export interface Normalized {
  norm: string;
  compact: string;
}

const QUOTES = /['’‘ʼ´`"“”«»]/g;
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

const EN_UNITS = [
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
const EN_TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];
// Accents are already gone by the time numbers are read (dieciséis → dieciseis).
const ES_WORDS: Record<string, number> = {
  cero: 0,
  uno: 1,
  una: 1,
  un: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciseis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
  veintiuno: 21,
  veintiun: 21,
  veintidos: 22,
  veintitres: 23,
  veinticuatro: 24,
  veinticinco: 25,
  veintiseis: 26,
  veintisiete: 27,
  veintiocho: 28,
  veintinueve: 29,
};
const ES_TENS: Record<string, number> = {
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
};

function unitValue(word: string, lang: Lang): number | null {
  if (lang === 'es') return Object.hasOwn(ES_WORDS, word) ? (ES_WORDS[word] ?? null) : null;
  const i = EN_UNITS.indexOf(word);
  return i >= 0 ? i : null;
}

function tensValue(word: string, lang: Lang): number | null {
  if (lang === 'es') return Object.hasOwn(ES_TENS, word) ? (ES_TENS[word] ?? null) : null;
  const i = EN_TENS.indexOf(word);
  return i >= 2 ? i * 10 : null;
}

/** "twenty one" → "21", "treinta y dos" → "32"; up to ninety-nine (§4.3 step 6). */
function numberWords(words: string[], lang: Lang): string[] {
  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i] ?? '';
    const tens = tensValue(w, lang);
    if (tens !== null) {
      const joiner = lang === 'es' && words[i + 1] === 'y' ? 1 : 0;
      const unit = unitValue(words[i + 1 + joiner] ?? '', lang);
      if (unit !== null && unit >= 1 && unit <= 9) {
        out.push(String(tens + unit));
        i += 1 + joiner;
        continue;
      }
      out.push(String(tens));
      continue;
    }
    const unit = unitValue(w, lang);
    out.push(unit === null ? w : String(unit));
  }
  return out;
}

export function normalize(text: string, lang: Lang): Normalized {
  let s = text.replace(QUOTES, '');
  s = s.normalize('NFKD').replace(/\p{M}/gu, ''); // combining marks: é → e, ñ → n
  s = s.toLowerCase();
  s = s.replace(/[ßøæœłđþı]/g, (c) => FOLD[c] ?? c);
  s = s.replace(/&/g, lang === 'es' ? ' y ' : ' and ').replace(/\+/g, ' plus ');
  s = s.replace(/[-_/.,]/g, ' ').replace(/[^a-z0-9 ]/g, '');
  let words = s.split(' ').filter((w) => w.length > 0);
  if (words.length > 1 && ARTICLES[lang].includes(words[0] ?? '')) words = words.slice(1);
  words = numberWords(words, lang);
  const norm = words.join(' ');
  return { norm, compact: norm.replace(/ /g, '') };
}

/** Light canonicalising stem of ONE word (audit #16): plural pairs meet (movies/movie → movi). */
export function stem(word: string, lang: Lang): string {
  if (/\d/.test(word) || word.length < 3) return word;
  let w = word;
  if (lang === 'en') {
    if (w.endsWith('ies') && w.length > 4) w = w.slice(0, -3) + 'i';
    else if (/(s|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
    else if (w.endsWith('s') && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
    if (w.endsWith('e') && w.length > 3) w = w.slice(0, -1);
    // knife/knives and olive/olives both meet at "…v" (a plain ves→f splits olives from olive).
    if (w.endsWith('f') && w.length > 3) w = w.slice(0, -1) + 'v';
    if (w.endsWith('y')) w = w.slice(0, -1) + 'i';
    return w;
  }
  if (w.endsWith('ces')) w = w.slice(0, -3) + 'z';
  else if (/[^aeiou]es$/.test(w)) w = w.slice(0, -2);
  else if (w.endsWith('s')) w = w.slice(0, -1);
  if (w.endsWith('e') && w.length > 3) w = w.slice(0, -1);
  return w;
}

/** The stems of every word, joined without spaces — the "stem" comparison key. */
export function stemKey(text: string, lang: Lang): string {
  return normalize(text, lang)
    .norm.split(' ')
    .map((w) => stem(w, lang))
    .join('');
}

/** Optimal string alignment distance (Damerau–Levenshtein, adjacent swaps count once). */
export function osa(a: string, b: string): number {
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i++) rows.push([i]);
  for (let j = 1; j <= b.length; j++) (rows[0] as number[])[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const row = rows[i] as number[];
    const prev = rows[i - 1] as number[];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d = Math.min(d, ((rows[i - 2] as number[])[j - 2] ?? 0) + 1);
      row[j] = d;
    }
  }
  return (rows[a.length] as number[])[b.length] ?? 0;
}

/** Edits a fuzzy match may use, by the target's compact length (§4.5). */
export function allowance(length: number): number {
  if (length <= 4) return 0;
  if (length <= 7) return 1;
  if (length <= 11) return 2;
  return 3;
}

function targets(item: MatchItem): string[] {
  return [item.answer, ...(item.accept ?? [])];
}

export function matchAnswer(input: string, item: MatchItem, lang: Lang): MatchLevel {
  const { compact } = normalize(input, lang);
  if (compact === '') return 'none';
  const key = stemKey(input, lang);
  const rejects = item.reject ?? [];
  if (rejects.some((r) => normalize(r, lang).compact === compact || stemKey(r, lang) === key))
    return 'none';
  const forms = targets(item);
  if (forms.some((f) => normalize(f, lang).compact === compact)) return 'exact';
  if (forms.some((f) => stemKey(f, lang) === key)) return 'stem';
  if (/\d/.test(compact)) return 'none';
  let best = Infinity;
  for (const f of forms) {
    const target = normalize(f, lang).compact;
    if (/\d/.test(target)) continue;
    const d = osa(compact, target);
    if (d <= allowance(target.length)) best = Math.min(best, d);
  }
  if (best === Infinity) return 'none';
  const nearReject = rejects.some((r) => osa(compact, normalize(r, lang).compact) <= best);
  return nearReject ? 'none' : 'fuzzy';
}

/** One player's text against another's (§4.6). */
export function sameAnswer(a: string, b: string, lang: Lang): boolean {
  const ca = normalize(a, lang).compact;
  const cb = normalize(b, lang).compact;
  if (ca === '' || cb === '') return false;
  if (ca === cb || stemKey(a, lang) === stemKey(b, lang)) return true;
  if (/\d/.test(ca) || /\d/.test(cb)) return false;
  return ca.length >= 6 && cb.length >= 6 && osa(ca, cb) <= 1;
}
