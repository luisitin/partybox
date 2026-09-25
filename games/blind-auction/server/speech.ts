// READER-VOICES (ADR-045): the auctioneer. Fixed lines ("Place your bets!", "It's a trap!") are
// requested early and cached by the host, so they start the instant they are needed; readings (the
// box, the winners) are requested only once their words are public — the winners' line only once
// the box is open. At most 10 keys are ever pending (P00 §5.7). Keys never reach a view before
// their line plays.
import type { SpeechRequest } from '@partybox/game-sdk';
import { pendingCap, speechKey, toSpeakable } from '@partybox/game-sdk/speech';
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

export function voiceOf(state: State): Exclude<Reader, 'none'> | null {
  return state.cfg.reader === 'none' ? null : state.cfg.reader;
}

function request(voice: string, text: string): SpeechRequest {
  const parts = toSpeakable(text, { voice, lang: 'en' });
  return { key: speechKey('blind-auction', voice, parts), voice, parts };
}

export function fixedRequest(state: State, line: FixedLine | null): SpeechRequest | null {
  const voice = voiceOf(state);
  return voice && line ? request(voice, FIXED_LINES[line]) : null;
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
    n === 0 ? 'Nobody saw that coming!' : n === 1 ? 'One lucky winner!' : `${n} winners!`;
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
    if (out.length >= pendingCap(state.seats.length)) break;
  }
  return out;
}
