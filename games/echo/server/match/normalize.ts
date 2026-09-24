// LOCAL STAND-IN for @partybox/game-sdk/match (Foundation F5, not on main yet — see
// docs/game-pack/echo/NOTES.md). Written to Part 00 §4.3 as amended by FOUNDATION-AUDIT #15, #25–27
// and the owner's ruling 16. Swap to the SDK module the day it lands; the tests stay.
// Pure and locale-free: no localeCompare / toLocale* / Intl (§4.1).

export type Lang = 'en' | 'es';

export interface Normalized {
  norm: string;
  compact: string;
}

// Audit #25: quotes and apostrophes go BEFORE NFKD, or "don´t" decomposes to "don t".
const QUOTES = /['’‘ʼ´`"“”]/g;
// Audit #26: letters NFKD leaves alone.
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
];
const ES_TENS = [
  '',
  '',
  'veinte',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
];
const ES_VEINTI = ['veinti', 'veintiun'];

function unitOf(word: string, lang: Lang): number {
  const units = lang === 'en' ? EN_UNITS : ES_UNITS;
  const i = units.indexOf(word);
  if (i >= 0) return i;
  if (lang === 'es' && (word === 'un' || word === 'una')) return 1;
  return -1;
}

/** Number words up to ninety-nine → digits (§4.3 step 6), on already-spaced words. */
function numbersToDigits(words: string[], lang: Lang): string[] {
  const tens = lang === 'en' ? EN_TENS : ES_TENS;
  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i] as string;
    const t = tens.indexOf(w);
    if (t >= 2) {
      // "twenty one" (hyphen already spaced) / "treinta y uno"
      const skipY = lang === 'es' && words[i + 1] === 'y' ? 1 : 0;
      const u = unitOf(words[i + 1 + skipY] ?? '', lang);
      if (u >= 1 && u <= 9) {
        out.push(String(t * 10 + u));
        i += 1 + skipY;
      } else out.push(String(t * 10));
      continue;
    }
    if (lang === 'es' && w.startsWith('veinti') && !ES_VEINTI.includes(w)) {
      const u = unitOf(w.slice(6), lang);
      if (u >= 1 && u <= 9) {
        out.push(String(20 + u));
        continue;
      }
    }
    const u = unitOf(w, lang);
    // Spanish "un"/"una" alone stay words: they are articles far more often than numbers.
    if (u >= 0 && !(lang === 'es' && (w === 'un' || w === 'una'))) out.push(String(u));
    else out.push(w);
  }
  return out;
}

export function normalize(text: string, lang: Lang): Normalized {
  let s = text.replace(QUOTES, '');
  s = s.normalize('NFKD').replace(/[̀-ͯ]/g, '');
  s = s.toLowerCase();
  s = s.replace(/[ßøæœłđþı]/g, (c) => FOLD[c] ?? c);
  s = s.replace(/&/g, lang === 'es' ? ' y ' : ' and ').replace(/\+/g, ' plus ');
  s = s.replace(/[-_/.,]/g, ' ');
  s = s.replace(/[^a-z0-9 ]/g, '');
  let words = s.split(' ').filter((w) => w.length > 0);
  // Audit #15/#27: drop ONE leading article, only when another word follows, before numbers.
  if (words.length > 1 && ARTICLES[lang].includes(words[0] as string)) words = words.slice(1);
  words = numbersToDigits(words, lang);
  const norm = words.join(' ');
  return { norm, compact: words.join('') };
}
