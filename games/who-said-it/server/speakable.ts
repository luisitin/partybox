// STAND-IN for the foundation's `toSpeakable` (F6, P4) until it lands on main — see NOTES.md. The
// display text never changes; only what the voice receives does. Foundation §5.3's English rules,
// in order, for pack text and player text alike (answers are player text: rules 7, 11–13 matter).
import type { SpeechPart } from '@partybox/game-sdk';
import type { Pronunciations } from '../content/schema';

const KEEP = new Set(
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
  'OK',
  'LOL',
  'OMG',
]);
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' '); // prettier-ignore
const TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');

function under100(n: number): string {
  if (n < 20) return ONES[n] as string;
  const t = TENS[Math.floor(n / 10)] as string;
  return n % 10 ? `${t}-${ONES[n % 10]}` : t;
}

export function numberWords(n: number): string {
  if (n < 100) return under100(n);
  if (n < 1000) {
    const rest = n % 100;
    return `${ONES[Math.floor(n / 100)]} hundred${rest ? ` ${under100(rest)}` : ''}`;
  }
  if (n < 1_000_000) {
    const rest = n % 1000;
    return `${numberWords(Math.floor(n / 1000))} thousand${rest ? ` ${numberWords(rest)}` : ''}`;
  }
  return String(n).split('').map((d) => ONES[Number(d)]).join(' '); // prettier-ignore
}

function year(n: number): string {
  if (n >= 2000 && n <= 2009) return `two thousand${n % 10 ? ` ${ONES[n % 10]}` : ''}`;
  const hi = Math.floor(n / 100);
  const lo = n % 100;
  return `${under100(hi)} ${lo === 0 ? 'hundred' : lo < 10 ? `oh ${ONES[lo]}` : under100(lo)}`;
}

const ORD: Readonly<Record<string, string>> = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' }; // prettier-ignore
function ordinal(n: number): string {
  const words = numberWords(n);
  const m = /([a-z]+)$/.exec(words);
  const last = m?.[1] ?? '';
  const head = words.slice(0, words.length - last.length);
  if (ORD[last]) return head + ORD[last];
  if (last.endsWith('y')) return `${head}${last.slice(0, -1)}ieth`;
  return `${words}th`;
}

function numbers(t: string): string {
  return t
    .replace(
      /\$(\d+)\.(\d\d)\b/g,
      (_, d: string, c: string) =>
        `${numberWords(+d)} dollar${+d === 1 ? '' : 's'} ${numberWords(+c)}`,
    ) // prettier-ignore
    .replace(
      /[$£€](\d+)/g,
      (m, d: string) =>
        `${numberWords(+d)} ${m[0] === '$' ? 'dollars' : m[0] === '£' ? 'pounds' : 'euros'}`,
    ) // prettier-ignore
    .replace(/'(\d)0s\b/g, (_, d: string) => `${TENS[+d] ?? ''}ies`.replace('yies', 'ies'))
    .replace(
      /\b(1[1-9]|20)(\d)0'?s\b/g,
      (_, h: string, d: string) => `${under100(+h)} ${`${TENS[+d]}`.replace(/y$/, 'ies')}`,
    ) // prettier-ignore
    .replace(/\b(\d+)(st|nd|rd|th)\b/g, (_, d: string) => ordinal(+d))
    .replace(
      /\b(\d{1,2}):(\d\d)\b/g,
      (_, h: string, m: string) =>
        `${numberWords(+h)} ${+m === 0 ? "o'clock" : +m < 10 ? `oh ${ONES[+m]}` : under100(+m)}`,
    ) // prettier-ignore
    .replace(
      /\b(\d+)\s?[–-]\s?(\d+)\b/g,
      (_, a: string, b: string) => `${numberWords(+a)} to ${numberWords(+b)}`,
    ) // prettier-ignore
    .replace(/\b1\/2\b/g, 'one half')
    .replace(/\b3\/4\b/g, 'three quarters')
    .replace(
      /\b(\d+)\.(\d+)\b/g,
      (_, a: string, b: string) =>
        `${numberWords(+a)} point ${[...b].map((d) => ONES[+d]).join(' ')}`,
    ) // prettier-ignore
    .replace(/(\d+)\s?%/g, (_, d: string) => `${numberWords(+d)} percent`)
    .replace(/#(\d+)/g, (_, d: string) => `number ${numberWords(+d)}`)
    .replace(/\b\d+\b/g, (d) => {
      const n = Number(d);
      if (d.length === 4 && n >= 1100 && n <= 2099) return year(n);
      return d.length > 7 ? [...d].map((x) => ONES[+x]).join(' ') : numberWords(n);
    });
}

const ABBREV: [RegExp, string][] = [
  [/\bDr\./g, 'Doctor'],
  [/\bMr\./g, 'Mister'],
  [/\bMrs\./g, 'Missus'],
  [/\bMs\./g, 'Miz'],
  [/\bSt\.(?=\s+[A-Z])/g, 'Saint'],
  [/\bSt\./g, 'Street'],
  [/\bvs\.?(?=\s)/gi, 'versus'],
  [/\betc\./gi, 'et cetera'],
  [/\be\.g\./gi, 'for example'],
  [/\bi\.e\./gi, 'that is'],
  [/\bNo\.(?=\s*\d)/g, 'number'],
];

/** Rule 3: possessives read as plurals (they sound the same and every voice reads plurals). */
function possessive(word: string): string {
  if (KEEP.has(word.toLowerCase())) return word;
  return word
    .replace(/^(.*?)'s$/i, (_, stem: string) =>
      /(s|x|z|ch|sh)$/i.test(stem) ? `${stem}es` : `${stem}s`,
    )
    .replace(/s'$/i, 's');
}

export interface SpeakOptions {
  /** Player-written text: shouting, stretched words and the length cap apply (rules 7, 12, 13). */
  player?: boolean;
  overrides?: Pronunciations;
}

/** Text → the parts a voice receives. Pure. */
export function toSpeakable(text: string, opts: SpeakOptions = {}): SpeechPart[] {
  // 1. straight apostrophes, no curly double quotes
  let t = text.replace(/[’‘ʼ´`]/g, "'").replace(/[“”"]/g, '');
  if (opts.player) {
    // 13. length cap at a word boundary; 12. stretched words; 7. shouting
    if (t.length > 140) t = t.slice(0, 140).replace(/\s+\S*$/, '');
    t = t.replace(/(\p{L})\1{2,}/gu, '$1$1');
    const letters = t.replace(/[^\p{L}]/gu, '');
    const caps = letters.replace(/[^\p{Lu}]/gu, '');
    if (letters.length > 3 && caps.length * 2 > letters.length)
      t = t.replace(/\b[\p{L}']+\b/gu, (w) => (SAY_AS_WORD.has(w) ? w : w.toLowerCase()));
  }
  t = t.replace(/\p{Extended_Pictographic}|\p{Emoji_Modifier}|[\u200d\ufe0f]/gu, ' '); // 11
  for (const [re, say] of ABBREV) t = t.replace(re, say); // 6
  t = t.replace(/\b([A-Z])\.(?:([A-Z])\.)+/g, (m) => m.replace(/\./g, '')); // 8a U.S.A. → USA
  t = t.replace(/(?:\.\.\.|…)/g, ',').replace(/(\w)\s*[—–]\s*(\w)/g, '$1, $2'); // 10
  t = t
    .replace(/\s*[()]\s*/g, ', ')
    .replace(/!{2,}/g, '!')
    .replace(/\?!+/g, '?')
    .replace(/\?{2,}/g, '?');
  t = t.replace(/_{2,}/g, 'blank'); // 9
  t = numbers(t); // 4
  t = t.replace(/&/g, ' and ').replace(/\+/g, ' plus ').replace(/@/g, ' at ').replace(/=/g, ' equals '); // prettier-ignore
  t = t.replace(/(\p{L})\/(\p{L})/gu, '$1 or $2'); // 5
  t = t.replace(/[^\p{L}\p{N}\s'.,!?;:-]/gu, ' ');
  const parts: SpeechPart[] = [];
  let run: string[] = [];
  const flush = (): void => {
    const s = run
      .join(' ')
      .replace(/\s+([,.!?;:])/g, '$1')
      .replace(/,{2,}/g, ',')
      .trim();
    if (s && /[\p{L}\p{N}]/u.test(s)) parts.push({ text: s });
    run = [];
  };
  for (const raw of t.split(/\s+/).filter(Boolean)) {
    const m = /^([^\p{L}\p{N}']*)([\p{L}\p{N}'-]+?)([^\p{L}\p{N}]*)$/u.exec(raw);
    const word = m?.[2] ?? raw;
    const entry = opts.overrides?.[word] ?? findAnyCase(opts.overrides, word);
    if (m && entry) {
      run.push(m[1] ?? '');
      flush();
      parts.push(entry.ipa ? { ipa: entry.ipa, text: entry.say } : { text: entry.say });
      run.push(m[3] ?? '');
      continue;
    }
    let w = possessive(word);
    if (/^[A-Z]{2,5}s?$/.test(w) && !SAY_AS_WORD.has(w)) w = [...w].join(' '); // 8b FBI → F B I
    run.push(`${m?.[1] ?? ''}${w}${m?.[3] ?? ''}`);
  }
  flush();
  return parts;
}

function findAnyCase(o: Pronunciations | undefined, word: string): Pronunciations[string] | null {
  if (!o) return null;
  const lower = word.toLowerCase();
  for (const [k, v] of Object.entries(o)) if (v.anyCase && k.toLowerCase() === lower) return v;
  return null;
}

/** §5.5: a name the reader can say — null when it has no vowel or is mostly digits and symbols. */
export function speakableName(name: string): string | null {
  const letters = name.replace(/[^\p{L}]/gu, '');
  if (letters.length * 2 < name.replace(/\s/g, '').length) return null;
  if (!/[aeiouyáéíóúü]/i.test(letters)) return null;
  return name.replace(/[_]+/g, ' ').trim();
}
