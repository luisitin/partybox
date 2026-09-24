// A thin local stand-in for the SDK's `toSpeakable` (P00 §5.2–5.4, F6 — not on main yet). It covers
// the rules this game's lines need: quotes, per-game overrides, possessives respelled as plurals,
// years, clock times, numbers, "a.m.", pacing punctuation. Swap to the SDK's once it lands (NOTES.md).
import type { Pronunciations } from '../content/schema';

const ONES = [
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

function underHundred(n: number): string {
  if (n < 20) return ONES[n] ?? '';
  const t = TENS[Math.floor(n / 10)] ?? '';
  return n % 10 === 0 ? t : `${t}-${ONES[n % 10] ?? ''}`;
}

function underThousand(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h === 0) return underHundred(rest);
  return rest === 0 ? `${ONES[h]} hundred` : `${ONES[h]} hundred ${underHundred(rest)}`;
}

/** 0 … 999 999 in words ("three hundred", "one thousand two hundred fifty"). */
export function numberWords(value: number): string {
  const n = Math.max(0, Math.floor(value));
  if (n >= 1_000_000) return String(n);
  const k = Math.floor(n / 1000);
  const rest = n % 1000;
  if (k === 0) return underThousand(rest);
  return rest === 0
    ? `${underThousand(k)} thousand`
    : `${underThousand(k)} thousand ${underThousand(rest)}`;
}

/** 1100–2099 read as a year: "nineteen eighty-five", "two thousand nine". */
function yearWords(y: number): string {
  if (y >= 2000 && y <= 2009) return `two thousand${y === 2000 ? '' : ` ${ONES[y - 2000]}`}`;
  const hi = Math.floor(y / 100);
  const lo = y % 100;
  if (lo === 0) return `${underHundred(hi)} hundred`;
  return `${underHundred(hi)} ${lo < 10 ? `oh ${ONES[lo]}` : underHundred(lo)}`;
}

const KEEP = new Set([
  "it's",
  "that's",
  "what's",
  "who's",
  "where's",
  "there's",
  "here's",
  "he's",
  "she's",
  "let's",
]);

function possessive(word: string): string {
  if (KEEP.has(word.toLowerCase())) return word;
  const stem = word.slice(0, -2);
  return /(s|x|z|ch|sh)$/i.test(stem) ? `${stem}es` : `${stem}s`;
}

function applyOverrides(text: string, overrides: Pronunciations): string {
  return text.replace(/[A-Za-z][A-Za-z'-]*/g, (word) => {
    const hit = overrides[word];
    if (hit) return hit.say;
    for (const [key, entry] of Object.entries(overrides))
      if (entry.anyCase === true && key.toLowerCase() === word.toLowerCase()) return entry.say;
    return word;
  });
}

/** What the voice should say for `text` (the screen keeps `text` as written). */
export function toSpeakable(text: string, overrides: Pronunciations = {}): string {
  let s = text.replace(/[’‘ʼ´`]/g, "'").replace(/[“”"]/g, '');
  s = applyOverrides(s, overrides);
  s = s.replace(/\b[A-Za-z]+'s\b/g, possessive).replace(/\b([A-Za-z]+s)'(?=\s|$)/g, '$1');
  s = s.replace(/\b(\d{1,2}):(\d{2})\b/g, (_, h: string, m: string) => {
    const mm = Number(m);
    return `${numberWords(Number(h))} ${mm === 0 ? "o'clock" : mm < 10 ? `oh ${numberWords(mm)}` : numberWords(mm)}`;
  });
  s = s.replace(/\ba\.m\./gi, 'A M').replace(/\bp\.m\./gi, 'P M');
  s = s.replace(/\b(1[1-9]\d\d|20\d\d)\b/g, (y) => yearWords(Number(y)));
  s = s.replace(/\b\d+\b/g, (n) => numberWords(Number(n)));
  s = s.replace(/…|\.\.\./g, ',').replace(/\s[–—]\s/g, ', ');
  s = s.replace(/[^\p{L}\p{N}\s.,!?'-]/gu, '');
  return s.replace(/\s+/g, ' ').trim();
}
