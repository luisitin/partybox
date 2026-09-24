// normalize(text, lang) → { norm, compact } (Part 00 §4.3 as amended by the audit, #15 #25–#27):
// quotes go before NFKD, a fold table for letters NFKD leaves alone, the article is dropped BEFORE
// number words turn into digits, and a lone article is kept. Pure and locale-free (no
// toLocale*/Intl/localeCompare), so every machine agrees.
// STAND-IN for @partybox/game-sdk/match (F5) — see docs/game-pack/fake-out/NOTES.md.
import { numberWordsToDigits } from './numbers';

export type { MatchLang } from './numbers';
import type { MatchLang } from './numbers';

export interface Normalized {
  /** Words separated by single spaces, e.g. "ice cream". */
  norm: string;
  /** The same without spaces, e.g. "icecream". */
  compact: string;
}

const QUOTES = /['’‘ʼ´`"“”]/g;
const COMBINING = /[̀-ͯ]/g;
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
const FOLDABLE = /[ßøæœłđþı]/g;
const ARTICLES: Readonly<Record<MatchLang, readonly string[]>> = {
  en: ['the', 'a', 'an'],
  es: ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'],
};

/** Drops one leading article when another word follows it ("the moose" → "moose", "a" stays). */
export function dropArticle(words: string[], lang: MatchLang): string[] {
  if (words.length > 1 && ARTICLES[lang].includes(words[0] as string)) return words.slice(1);
  return words;
}

export function normalize(text: string, lang: MatchLang = 'en'): Normalized {
  let t = text.replace(QUOTES, '');
  t = t.normalize('NFKD').replace(COMBINING, '');
  t = t.toLowerCase().replace(FOLDABLE, (c) => FOLD[c] ?? c);
  t = t.replace(/&/g, lang === 'es' ? ' y ' : ' and ').replace(/\+/g, ' plus ');
  t = t.replace(/[-_/.,]/g, ' ');
  t = t.replace(/[^a-z0-9 ]/g, '');
  const words = dropArticle(
    t.split(' ').filter((w) => w.length > 0),
    lang,
  );
  const norm = numberWordsToDigits(words.join(' '), lang);
  return { norm, compact: norm.replace(/ /g, '') };
}

/** The compact form alone (the common comparison key). */
export function compact(text: string, lang: MatchLang = 'en'): string {
  return normalize(text, lang).compact;
}
