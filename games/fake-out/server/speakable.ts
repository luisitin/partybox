// toSpeakable(text) → SpeechPart[] (Part 00 §5.3–5.4): the display text never changes, only what
// the voice receives. The rules Fake-Out's facts and players' lies hit, in the spec's order:
// quotes, overrides, possessives as plurals, numbers and years, symbols, abbreviations, shouting,
// acronyms, blanks, pacing punctuation, stray symbols, stretched words, the length cap.
// STAND-IN for @partybox/game-sdk/speech (F6) — see docs/game-pack/fake-out/NOTES.md.
import type { SpeechPart } from '@partybox/game-sdk';
import { BLANK } from '../content/schema';
import { numberToWords, yearToWords } from './spoken-numbers';

export interface Override {
  say: string;
  ipa?: string | undefined;
  phonemes?: string | undefined;
  anyCase?: boolean | undefined;
}

export interface SpeakableOptions {
  overrides?: Readonly<Record<string, Override>>;
  /** Player-written text: shouting, stretched words and the 140-character cap apply. */
  player?: boolean;
}

const CONTRACTIONS = new Set(
  "don't can't won't isn't it's i'm i'll i'd i've you're we're they're they've let's that's what's who's where's there's here's he's she's o'clock ma'am y'all".split(
    ' ',
  ),
);
const SAY_AS_WORD = new Set([
  'NASA',
  'NATO',
  'UNICEF',
  'FIFA',
  'IKEA',
  'SCUBA',
  'LASER',
  'RADAR',
  'NASCAR',
]);
const ABBREVIATIONS: readonly [RegExp, string][] = [
  [/\bDr\./g, 'Doctor'],
  [/\bMr\./g, 'Mister'],
  [/\bMrs\./g, 'Missus'],
  [/\bMs\./g, 'Miz'],
  [/\bSt\.(?=\s+[A-Z])/g, 'Saint'],
  [/\bSt\./g, 'Street'],
  [/\bvs\./g, 'versus'],
  [/\betc\./g, 'et cetera'],
  [/\be\.g\./g, 'for example'],
  [/\bi\.e\./g, 'that is'],
  [/\bNo\.(?=\s*\d)/g, 'number'],
];

function possessives(text: string): string {
  return text.replace(/\b([A-Za-z0-9]+)'([A-Za-z]*)/g, (whole, word: string, rest: string) => {
    if (CONTRACTIONS.has(whole.toLowerCase())) return whole;
    if (rest === '') return /s$/i.test(word) ? word : whole; // players' → players
    if (rest.toLowerCase() !== 's') return whole; // O'Neill, rock'n'roll stay as written
    if (/\d$/.test(word)) return `${word}s`; // 1990's → 1990s
    return /(s|x|z|ch|sh)$/i.test(word) ? `${word}es` : `${word}s`;
  });
}

function numbers(text: string): string {
  let t = text.replace(/#(\d)/g, 'number $1');
  t = t.replace(
    /\$(\d+)\.(\d{2})\b/g,
    (_, d: string, c: string) =>
      `${numberToWords(Number(d))} dollar${d === '1' ? '' : 's'} ${numberToWords(Number(c))}`,
  );
  t = t.replace(/([$£€])(\d[\d,]*)/g, (_, sym: string, d: string) => {
    const n = Number(d.replace(/,/g, ''));
    const unit = sym === '$' ? 'dollar' : sym === '£' ? 'pound' : 'euro';
    return `${numberToWords(n)} ${unit}${n === 1 ? '' : 's'}`;
  });
  t = t.replace(/'(\d0)s\b/g, (_, d: string) => `${numberToWords(Number(d)).replace(/y$/, 'ies')}`);
  t = t.replace(/\b(1[1-9]|20)(\d0)s\b/g, (_, c: string, d: string) =>
    yearToWords(Number(c + d))
      .replace(/y$/, 'ies')
      .replace(/hundred$/, 'hundreds'),
  );
  t = t.replace(/\b(\d+)(st|nd|rd|th)\b/g, (_, d: string) => numberToWords(Number(d), true));
  t = t.replace(
    /\b(\d{1,2}):(\d{2})\b/g,
    (_, h: string, m: string) =>
      `${numberToWords(Number(h))} ${m === '00' ? "o'clock" : numberToWords(Number(m))}`,
  );
  t = t.replace(/\b(\d+)\s*[–-]\s*(\d+)\b/g, '$1 to $2');
  t = t.replace(/\b1\/2\b/g, 'one half').replace(/\b3\/4\b/g, 'three quarters');
  t = t.replace(/\b1\/4\b/g, 'one quarter');
  t = t.replace(/(\d)\s*%/g, '$1 percent');
  t = t.replace(
    /\b(\d+)\.(\d+)\b/g,
    (_, a: string, b: string) =>
      `${numberToWords(Number(a))} point ${[...b].map((c) => numberToWords(Number(c))).join(' ')}`,
  );
  t = t.replace(/\b\d{1,3}(,\d{3})+\b/g, (d) => d.replace(/,/g, ''));
  t = t.replace(/\b\d+\b/g, (d) => {
    const n = Number(d);
    return d.length === 4 && n >= 1100 && n <= 2099 ? yearToWords(n) : numberToWords(n);
  });
  return t;
}

function acronyms(text: string, player: boolean): string {
  let t = text.replace(/\b(?:[A-Z]\.){2,}/g, (m) => m.replace(/\./g, ''));
  if (player) {
    const letters = t.replace(/[^A-Za-z]/g, '');
    const caps = t.replace(/[^A-Z]/g, '');
    if (letters.length > 3 && caps.length * 2 > letters.length)
      t = t.replace(/\b[A-Za-z]+\b/g, (w) => (SAY_AS_WORD.has(w) ? w : w.toLowerCase()));
  }
  return t.replace(/\b[A-Z]{2,5}\b/g, (w) => (SAY_AS_WORD.has(w) ? w : [...w].join(' ')));
}

function tidy(text: string, player: boolean): string {
  let t = text;
  t = t.replace(/_{2,}/g, 'blank');
  t = t.replace(/…|\.{3}/g, ',').replace(/\s[–—]\s|[–—]/g, ', ');
  t = t.replace(/\(([^)]*)\)/g, ', $1,');
  t = t.replace(/!{2,}/g, '!').replace(/\?!+/g, '?');
  t = t.replace(/&/g, ' and ').replace(/\+/g, ' plus ').replace(/@/g, ' at ');
  t = t.replace(/#(\d)/g, 'number $1').replace(/=/g, ' equals ');
  t = t.replace(/\b([A-Za-z]+)\/([A-Za-z]+)\b/g, '$1 or $2');
  t = t.replace(/[^\p{L}\p{N}\s.,!?;:'-]/gu, ' ');
  if (player) t = t.replace(/(\p{L})\1{2,}/gu, '$1$1');
  t = t
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/,+/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
  t = t.replace(/^,\s*/, '');
  if (player && t.length > 140) t = t.slice(0, 140).replace(/\s+\S*$/, '');
  return t;
}

function overrideRegex(word: string, anyCase: boolean): RegExp {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, anyCase ? 'giu' : 'gu');
}

/** Everything but overrides: one text run through rules 3–13. */
function rewrite(text: string, player: boolean): string {
  let t = possessives(text);
  for (const [re, say] of ABBREVIATIONS) t = t.replace(re, say);
  t = numbers(t);
  t = acronyms(t, player);
  return tidy(t, player);
}

/** The reading of `text` as parts: overrides first (whole words, case-sensitive unless
 *  `anyCase`), each override its own part; the rest goes through the rewrite rules. */
export function toSpeakable(text: string, options: SpeakableOptions = {}): SpeechPart[] {
  const player = options.player === true;
  let t = text.replace(/[’‘ʼ´`]/g, "'").replace(/[“”]/g, '');
  if (t.includes(BLANK)) t = t.replace(/_{2,}/g, ' blank ');
  const marks: Override[] = [];
  for (const [word, entry] of Object.entries(options.overrides ?? {}))
    t = t.replace(overrideRegex(word, entry.anyCase === true), () => {
      marks.push(entry);
      return ` \u0000${marks.length - 1}\u0000 `;
    });
  const parts: SpeechPart[] = [];
  for (const piece of t.split(/\u0000(\d+)\u0000/)) {
    const index = /^\d+$/.test(piece) ? Number(piece) : -1;
    const mark = index >= 0 && index < marks.length ? marks[index] : undefined;
    if (mark) {
      const ipa = mark.ipa ?? mark.phonemes;
      parts.push(ipa ? { ipa, text: mark.say } : { text: mark.say });
      continue;
    }
    const said = rewrite(piece, player);
    if (said.length > 0) parts.push({ text: said });
  }
  return parts;
}
