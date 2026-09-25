// READER-VOICES (ADR-045): what Hive Rank's reader says (SPEC §6.11) — the question at `rank`,
// each spot at `hive`, and five short stock lines. The stock lines go through the same live path
// as the rest (the host renders each key once and keeps it), so they are ready long before they
// play. Spot lines are asked for only when `hive` begins: before that they would give the hive
// away. Pure: the host makes the audio.
import type { SpeechPart, SpeechRequest } from '@partybox/game-sdk';
import { PRONUNCIATIONS } from './content';
import type { State } from './types';

export const LINES = {
  rankThem: 'Rank them!',
  decided: 'The hive has decided.',
  perfect: 'Perfect hive!',
  queen: 'Queen bee!',
  short: 'Not enough bees.',
} as const;
export type LineId = keyof typeof LINES;

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen'];
const TEENS2 = ['seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** 0–9999 in words ("one hundred ducks"); anything larger is left as digits. */
export function numberWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 9999) return String(n);
  if (n < 10) return ONES[n] ?? '';
  if (n < 17) return TEENS[n - 10] ?? '';
  if (n < 20) return TEENS2[n - 17] ?? '';
  if (n < 100) {
    const unit = n % 10;
    return `${TENS[Math.floor(n / 10)]}${unit ? `-${ONES[unit]}` : ''}`;
  }
  if (n < 1000) {
    const rest = n % 100;
    return `${ONES[Math.floor(n / 100)]} hundred${rest ? ` ${numberWords(rest)}` : ''}`;
  }
  const rest = n % 1000;
  return `${numberWords(Math.floor(n / 1000))} thousand${rest ? ` ${numberWords(rest)}` : ''}`;
}

/**
 * A thin stand-in for the SDK's `toSpeakable` (foundation §5.3, not on main yet — NOTES.md):
 * straight quotes, the game's own pronunciations, digits and a few symbols as words, emoji and
 * stray symbols gone. The screen keeps the written text; only the voice gets this.
 */
export function speakable(text: string): string {
  let t = text.replace(/[’‘ʼ´`]/g, "'").replace(/[“”]/g, '');
  t = t.replace(/[A-Za-z][A-Za-z'-]*/g, (word) => {
    const exact = PRONUNCIATIONS[word];
    if (exact) return exact.say;
    const lower = word.toLowerCase();
    for (const [key, entry] of Object.entries(PRONUNCIATIONS))
      if (entry.anyCase && key.toLowerCase() === lower) return entry.say;
    return word;
  });
  t = t
    .replace(/(\d+)%/g, '$1 percent')
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/#(\d)/g, 'number $1')
    .replace(/\d+/g, (d) => numberWords(Number(d)))
    .replace(/[…]|\.{3}/g, ',')
    .replace(/\s[–—]\s/g, ', ')
    .replace(/[^A-Za-z0-9 .,!?':;-]/gu, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

/** A stable short key for a reading (FNV-1a over the voice and its parts, twice for 64 bits); the
 *  host's key rule allows no hyphens and at most 40 characters. */
export function speechKey(voice: string, parts: readonly SpeechPart[]): string {
  const text = `${voice}|${JSON.stringify(parts)}`;
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
  }
  return `hr${a.toString(36)}${b.toString(36)}`;
}

function request(voice: string, text: string): SpeechRequest {
  const parts: SpeechPart[] = [{ text: speakable(text) }];
  return { key: speechKey(voice, parts), voice, parts };
}

/** The room's reader, or null when nobody reads aloud. */
export function voiceOf(state: State): string | null {
  return state.settings.reader === 'none' ? null : state.settings.reader;
}

export function lineRequest(state: State, id: LineId): SpeechRequest | null {
  const voice = voiceOf(state);
  return voice ? request(voice, LINES[id]) : null;
}

/** Round `n`'s question sentence ("Rank these road-trip snacks, from best to worst."). */
export function sayRequest(state: State, n: number): SpeechRequest | null {
  const voice = voiceOf(state);
  const question = state.questions[n - 1];
  return voice && question ? request(voice, question.say) : null;
}

/** "Number five: Egg sandwich." — the spot that lands at hive step `step` (1 = 5th … 5 = 1st). */
export function spotText(state: State, step: number): string | null {
  const place = 6 - step;
  const id = state.q.hive?.[place - 1];
  const item = state.questions[state.q.n - 1]?.items.find((i) => i.id === id);
  return item ? `Number ${numberWords(place)}: ${item.label}.` : null;
}

export function spotRequest(state: State, step: number): SpeechRequest | null {
  const voice = voiceOf(state);
  const text = spotText(state, step);
  return voice && text ? request(voice, text) : null;
}

/** The reading's length when it is made (-1: failed), undefined while it is being made. */
export function msOf(state: State, req: SpeechRequest | null): number | undefined {
  return req ? state.speechMs[req.key] : undefined;
}

/** Everything this state wants made. The stock lines and round 1's question from `intro` on; each
 *  next question during `score` (so it is ready when `rank` opens); the five spots from `hive`. */
export function speech(state: State): SpeechRequest[] {
  if (!voiceOf(state)) return [];
  const phase = state.phase.id;
  const out: (SpeechRequest | null)[] = [];
  if (phase === 'hive' && state.q.hive)
    for (let s = 1; s <= 5; s++) out.push(spotRequest(state, s));
  if (phase === 'intro' || phase === 'rank' || phase === 'hive')
    for (const id of Object.keys(LINES) as LineId[]) out.push(lineRequest(state, id));
  if (phase === 'intro' || phase === 'rank') out.push(sayRequest(state, state.q.n));
  if (phase === 'score') out.push(sayRequest(state, state.q.n + 1));
  const seen = new Set<string>();
  return out
    .filter((r): r is SpeechRequest => r !== null && state.speechMs[r.key] === undefined)
    .filter((r) => !seen.has(r.key) && seen.add(r.key) !== undefined)
    .slice(0, 10);
}
