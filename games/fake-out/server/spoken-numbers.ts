// Numbers and years as words for the reader (Part 00 §5.3 rule 4). Pure, English only (the four
// Kokoro voices are English).
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
const ORDINAL: Readonly<Record<string, string>> = {
  one: 'first',
  two: 'second',
  three: 'third',
  five: 'fifth',
  eight: 'eighth',
  nine: 'ninth',
  twelve: 'twelfth',
};
const SCALES: readonly [number, string][] = [
  [1_000_000_000, 'billion'],
  [1_000_000, 'million'],
  [1_000, 'thousand'],
  [100, 'hundred'],
];

function under100(n: number): string {
  if (n < 20) return ONES[n] ?? '';
  const ten = TENS[Math.floor(n / 10)] ?? '';
  return n % 10 === 0 ? ten : `${ten}-${ONES[n % 10] ?? ''}`;
}

function cardinal(n: number): string {
  if (n < 100) return under100(n);
  for (const [size, word] of SCALES)
    if (n >= size) {
      const head = cardinal(Math.floor(n / size));
      const rest = n % size;
      if (rest === 0) return `${head} ${word}`;
      return `${head} ${word}${rest < 100 && size >= 100 ? ' and' : ''} ${cardinal(rest)}`;
    }
  return String(n);
}

function toOrdinal(words: string): string {
  const m = /^(.*?)([a-z]+)$/.exec(words);
  if (!m) return words;
  const [, head = '', last = ''] = m;
  if (ORDINAL[last]) return `${head}${ORDINAL[last]}`;
  if (last.endsWith('y')) return `${head}${last.slice(0, -1)}ieth`;
  return `${head}${last}th`;
}

/** 42 → "forty-two"; `ordinal` → "forty-second". Numbers past a trillion stay digits. */
export function numberToWords(n: number, ordinal = false): string {
  if (!Number.isInteger(n) || n < 0 || n >= 1e12) return String(n);
  const words = cardinal(n);
  return ordinal ? toOrdinal(words) : words;
}

/** 1987 → "nineteen eighty-seven", 1900 → "nineteen hundred", 2007 → "two thousand seven",
 *  1906 → "nineteen oh six". */
export function yearToWords(y: number): string {
  if (y >= 2000 && y <= 2009) return y === 2000 ? 'two thousand' : `two thousand ${ONES[y - 2000]}`;
  const head = Math.floor(y / 100);
  const tail = y % 100;
  if (tail === 0) return `${under100(head)} hundred`;
  return `${under100(head)} ${tail < 10 ? `oh ${ONES[tail]}` : under100(tail)}`;
}
