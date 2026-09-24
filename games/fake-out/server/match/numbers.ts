// Number words up to ninety-nine → digits (Part 00 §4.3 step 6), English and Spanish. Works on
// already-normalized text (lowercase, no hyphens, single spaces). Pure and locale-free.
// STAND-IN for @partybox/game-sdk/match (F5) — see docs/game-pack/fake-out/NOTES.md.
/** Which language's articles and number words apply. */
export type MatchLang = 'en' | 'es';

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
const ES_VEINTI = [
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

function table(lang: MatchLang): { units: string[]; tens: string[] } {
  return lang === 'es' ? { units: ES_UNITS, tens: ES_TENS } : { units: EN_UNITS, tens: EN_TENS };
}

/** Rewrites every number word (and "twenty one" / "treinta y uno" pairs) as digits. */
export function numberWordsToDigits(text: string, lang: MatchLang): string {
  const { units, tens } = table(lang);
  const words = text.split(' ');
  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i] as string;
    const ten = tens.indexOf(w);
    if (ten >= 2) {
      // "twenty one" (EN) or "treinta y uno" (ES).
      const joiner = lang === 'es' && words[i + 1] === 'y' ? 2 : 1;
      const unit = units.indexOf(words[i + joiner] ?? '');
      if (unit >= 1 && unit <= 9) {
        out.push(String(ten * 10 + unit));
        i += joiner;
        continue;
      }
      out.push(String(ten * 10));
      continue;
    }
    const unit = units.indexOf(w);
    if (unit >= 0) {
      out.push(String(unit));
      continue;
    }
    const veinti = lang === 'es' ? ES_VEINTI.indexOf(w) : -1;
    out.push(veinti >= 0 ? String(20 + veinti) : w);
  }
  return out.join(' ');
}
