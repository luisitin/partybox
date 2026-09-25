// READER-VOICES (ADR-045): the auctioneer. Fixed lines ("Place your bets!", "It's a trap!") are
// requested early and cached by the host, so they start the instant they are needed; readings (the
// box, the winners) are requested only once their words are public — the winners' line only once
// the box is open. At most 10 keys are ever pending (P00 §5.7). Keys never reach a view before
// their line plays.
import type { SpeechRequest } from '@partybox/game-sdk';
import { PRONUNCIATIONS } from './content';
import { numberWords, toSpeakable } from './speak';
import type { ContentKind, Reader, State } from './types';

export const FIXED_LINES = {
  bets: 'Place your bets!',
  closed: 'Bets are closed.',
  grand: 'The grand box!',
  treasure: 'Treasure!',
  jackpot: 'Jackpot!',
  trap: "It's a trap!",
  raccoon: 'A raccoon!',
  mirror: 'A magic mirror!',
  twins: 'Twins!',
  receipt: 'Just a receipt.',
  empty: "It's empty!",
  pick: 'We have a winner!',
} as const satisfies Record<string, string> & Record<ContentKind, string>;
export type FixedLine = keyof typeof FIXED_LINES;

const MAX_PENDING = 10;

/** A stable short key (FNV-1a twice → 64 bits; the host accepts [a-z0-9]{6,40}). */
export function speechKey(voice: string, text: string): string {
  const s = `ba2|${voice}|${text}`;
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
  }
  return `ba${a.toString(36)}${b.toString(36)}`;
}

export function voiceOf(state: State): Exclude<Reader, 'none'> | null {
  return state.cfg.reader === 'none' ? null : state.cfg.reader;
}

function request(voice: string, text: string): SpeechRequest {
  const said = toSpeakable(text, PRONUNCIATIONS);
  return { key: speechKey(voice, said), voice, parts: [{ text: said }] };
}

export function fixedRequest(state: State, line: FixedLine | null): SpeechRequest | null {
  const voice = voiceOf(state);
  return voice && line ? request(voice, FIXED_LINES[line]) : null;
}

/** "Box three: the Pirate's Chest. Found under a palm tree…" — public from `box` on. */
export function boxText(state: State, idx: number): string | null {
  const round = state.boxes[idx];
  if (!round) return null;
  const opener = round.box.grand ? 'The grand box!' : `Box ${numberWords(idx + 1)}:`;
  return `${opener} The ${round.box.name}. ${round.box.flavour} What's inside?`;
}

/** The owner (2026-09-25): the host just read the screen and was too much — the box is no longer
 *  read aloud (the screen already says it); the voice keeps its short calls only. */
export function boxRequest(_state: State, _idx: number): SpeechRequest | null {
  return null;
}

/** The content the open box shows: its fixed line. */
export function lineOf(_state: State): FixedLine | null {
  // No per-content call ("A raccoon!") any more: the winners' line says what matters.
  return null;
}

/** How many called it right (with a stake): only once the box is open (step 1). */
export function winners(state: State): number {
  const round = state.boxes[state.r.idx];
  if (!round) return 0;
  return Object.values(state.r.bets).filter((b) => b.amount > 0 && b.option === round.outcome)
    .length;
}

/** "Two winners!" — requested only once the box has opened (§8.8's rule for the outcome line). */
export function openRequest(state: State): SpeechRequest | null {
  const voice = voiceOf(state);
  if (!voice || state.phase.id !== 'open' || state.r.step !== 1) return null;
  const n = winners(state);
  const text =
    n === 0
      ? 'Nobody saw that coming!'
      : n === 1
        ? 'One lucky winner!'
        : `${numberWords(n)} winners!`;
  return request(voice, text);
}

/** Every reading this state wants, most urgent first, never more than 10 still pending. */
export function speech(state: State): SpeechRequest[] {
  if (!voiceOf(state) || state.phase.id === 'done') return [];
  const want: (SpeechRequest | null)[] = [];
  const phase = state.phase.id;
  const idx = state.r.idx;
  if (phase === 'rules') want.push(boxRequest(state, 0));
  if (phase === 'box') want.push(boxRequest(state, idx));
  if (phase === 'open') want.push(openRequest(state), boxRequest(state, idx + 1));
  for (const line of ['bets', 'closed'] as FixedLine[]) want.push(fixedRequest(state, line));
  for (const line of Object.keys(FIXED_LINES) as FixedLine[]) want.push(fixedRequest(state, line));
  const seen = new Set<string>();
  const out: SpeechRequest[] = [];
  for (const r of want) {
    if (!r || seen.has(r.key) || state.speechMs[r.key] !== undefined) continue;
    seen.add(r.key);
    out.push(r);
    if (out.length >= MAX_PENDING) break;
  }
  return out;
}
