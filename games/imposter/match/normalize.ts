// STAND-IN for @partybox/game-sdk/match (foundation F5, P3) until it lands on main — see
// docs/game-pack/imposter/NOTES.md. Follows Part 00 §4.3–4.4 with the audit errata the owner
// accepted (#15 article before numbers, #16 canonical stems, #25 quotes before NFKD, #26 fold
// table, #27 a lone article stays). Pure and locale-free: no Intl, no toLocale*, no localeCompare.

export type MatchLang = 'en' | 'es';

export interface Normalized {
  /** "ice cream" */
  norm: string;
  /** "icecream" */
  compact: string;
}

const QUOTES = /['’‘ʼ´`"“”]/g;
const COMBINING = /[̀-ͯ]/g;
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
const ARTICLES: Record<MatchLang, readonly string[]> = {
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
const ES_UNITS = [
  'cero',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciseis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidos',
  'veintitres',
  'veinticuatro',
  'veinticinco',
  'veintiseis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
];
const ES_TENS = [
  '',
  '',
  '',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
];

function numberWords(lang: MatchLang): Map<string, number> {
  const out = new Map<string, number>();
  const units = lang === 'en' ? EN_UNITS : ES_UNITS;
  units.forEach((w, i) => out.set(w, i));
  if (lang === 'es') out.set('un', 1).set('una', 1);
  const tens = lang === 'en' ? EN_TENS : ES_TENS;
  tens.forEach((w, t) => {
    if (!w) return;
    out.set(w, t * 10);
    for (let u = 1; u <= 9; u++) {
      const unit = units[u] ?? '';
      if (lang === 'en') {
        out.set(`${w} ${unit}`, t * 10 + u); // "twenty one" (hyphens are spaces by now)
        out.set(`${w}${unit}`, t * 10 + u);
      } else {
        out.set(`${w} y ${unit}`, t * 10 + u); // "treinta y uno"
      }
    }
  });
  return out;
}
const NUMBERS: Record<MatchLang, Map<string, number>> = {
  en: numberWords('en'),
  es: numberWords('es'),
};

function numbersToDigits(words: string[], lang: MatchLang): string[] {
  const table = NUMBERS[lang];
  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    // Longest run first: "treinta y uno" (3), "twenty one" (2), "seven" (1).
    let hit = false;
    for (const len of [3, 2, 1]) {
      if (i + len > words.length) continue;
      const value = table.get(words.slice(i, i + len).join(' '));
      if (value === undefined) continue;
      out.push(String(value));
      i += len - 1;
      hit = true;
      break;
    }
    if (!hit) out.push(words[i] ?? '');
  }
  return out;
}

/** Part 00 §4.3 as amended. Returns the spaced and the compact form. */
export function normalize(text: string, lang: MatchLang = 'en'): Normalized {
  let s = text.replace(QUOTES, '');
  s = s.normalize('NFKD').replace(COMBINING, '').toLowerCase();
  s = s.replace(/[ßøæœłđþı]/g, (c) => FOLD[c] ?? c);
  s = s.replace(/&/g, lang === 'es' ? ' y ' : ' and ').replace(/\+/g, ' plus ');
  s = s.replace(/[-_/.,]/g, ' ').replace(/[^a-z0-9 ]/g, ' ');
  let words = s.split(' ').filter((w) => w.length > 0);
  // Errata #15 + #27: drop one leading article first (so "una piñata" stays a piñata), and only
  // when another word follows it.
  if (words.length > 1 && ARTICLES[lang].includes(words[0] ?? '')) words = words.slice(1);
  words = numbersToDigits(words, lang);
  const norm = words.join(' ');
  return { norm, compact: words.join('') };
}

function stemEn(w: string): string {
  let s = w;
  if (s.length > 4 && s.endsWith('ies')) s = `${s.slice(0, -3)}i`;
  else if (s.endsWith('ves') && s.length - 3 >= 3) s = `${s.slice(0, -3)}f`;
  else if (/(s|x|z|ch|sh)es$/.test(s) && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith('s') && !/(ss|us|is)$/.test(s) && s.length > 3) s = s.slice(0, -1);
  if (s.length > 3 && s.endsWith('e')) s = s.slice(0, -1);
  if (s.length > 2 && s.endsWith('y')) s = `${s.slice(0, -1)}i`;
  return s;
}

function stemEs(w: string): string {
  let s = w;
  if (s.endsWith('ces') && s.length > 4) s = `${s.slice(0, -3)}z`;
  else if (/[^aeiou]es$/.test(s) && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith('s') && s.length > 3) s = s.slice(0, -1);
  if (s.length > 3 && s.endsWith('e')) s = s.slice(0, -1);
  return s;
}

/** Part 00 §4.4 with the canonicalising errata (#16): movie/movies, horse/horses meet. */
export function stem(word: string, lang: MatchLang = 'en'): string {
  return lang === 'es' ? stemEs(word) : stemEn(word);
}

/** Stems every word of a normalized text; the compact of the stems. */
export function stemCompact(text: string, lang: MatchLang = 'en'): string {
  const { norm } = normalize(text, lang);
  return norm
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => stem(w, lang))
    .join('');
}
