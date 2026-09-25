// READER-VOICES (ADR-045) for Herd Mind (SPEC §2.12): the question when `answer` starts, the herd's
// answer at the verdict, and five fixed lines. Every line is asked for ahead of its moment (the
// next question during `score`, the tile answers while people pick) so no reveal waits for a voice.
// Every line goes through the SDK's toSpeakable (foundation F6) with the game's own respellings.
import type { SpeechRequest } from '@partybox/game-sdk';
import { speechKey, toSpeakable } from '@partybox/game-sdk/speech';
import { answerLabel, PRONUNCIATIONS } from './content';
import type { State } from './types';

export const FIXED = {
  spoken: 'The herd has spoken.',
  tie: "No herd. It's a tie.",
  sheep: 'Black sheep!',
  baa: 'Baa.',
  winner: 'We have a winner.',
} as const;
export type FixedLine = keyof typeof FIXED;

/** At most this many readings are asked for at once (foundation §5.7). */
const MAX_PENDING = 10;

function voiceOf(state: State): string | null {
  return state.cfg.reader === 'none' ? null : state.cfg.reader;
}

function request(voice: string, text: string): SpeechRequest {
  const parts = toSpeakable(text, { voice, lang: 'en', overrides: PRONUNCIATIONS });
  return { key: speechKey('herd-mind', voice, parts), voice, parts };
}

export function questionReading(state: State, n: number): SpeechRequest | null {
  const voice = voiceOf(state);
  const item = state.questions[n];
  return voice && item ? request(voice, item.say ?? item.prompt) : null;
}

/** "Pepperoni!" — the herd's answer, said at the verdict. */
export function herdReading(state: State, label: string): SpeechRequest | null {
  const voice = voiceOf(state);
  return voice ? request(voice, `${label}!`) : null;
}

export function fixedReading(state: State, line: FixedLine): SpeechRequest | null {
  const voice = voiceOf(state);
  return voice ? request(voice, FIXED[line]) : null;
}

/** How many likely herd answers are voiced ahead: enough to cover most verdicts, few enough that
 *  the next question is never stuck behind them on a busy host. */
const LIKELY = 4;

/** The labels the herd most likely gets this question: the heaviest answers on show. */
function likelyLabels(state: State): string[] {
  const item = state.questions[state.q.n];
  if (!item) return [];
  const shown = state.q.tiles ? new Set(state.q.tiles.map((t) => t.id)) : null;
  return item.answers
    .filter((a) => !shown || shown.has(a.id))
    .sort((x, y) => y.weight - x.weight)
    .slice(0, LIKELY)
    .map(answerLabel);
}

/**
 * Every reading this state wants, most urgent first, minus the ones already made: the question
 * on stage, the herd's answer once known, the fixed lines, the likely herd answers — and the NEXT
 * question a whole question ahead, so it is made long before its `answer` starts.
 */
export function speech(state: State): SpeechRequest[] {
  if (!voiceOf(state) || state.phase.id === 'done') return [];
  const want: (SpeechRequest | null)[] = [];
  const phase = state.phase.id;
  const n = state.q.n;
  const fixed = (Object.keys(FIXED) as FixedLine[]).map((line) => fixedReading(state, line));
  if (phase === 'intro') want.push(questionReading(state, 0), ...fixed, questionReading(state, 1));
  if (phase === 'answer' || phase === 'herd') {
    want.push(questionReading(state, n));
    const herd = state.q.groups?.find((g) => g.key === state.q.herd);
    if (herd) want.push(herdReading(state, herd.label));
    want.push(...fixed);
    for (const label of likelyLabels(state)) want.push(herdReading(state, label));
    want.push(questionReading(state, n + 1));
  }
  if (phase === 'score')
    want.push(questionReading(state, n + 1), ...fixed, questionReading(state, n + 2));
  const seen = new Set<string>();
  const out: SpeechRequest[] = [];
  for (const r of want) {
    if (!r || seen.has(r.key) || state.speechMs[r.key] !== undefined) continue;
    seen.add(r.key);
    out.push(r);
  }
  return out.slice(0, MAX_PENDING);
}

/** A reading's length once the host has made it; null while pending or when it failed. */
export function readyMs(state: State, req: SpeechRequest | null): number | null {
  const ms = req ? state.speechMs[req.key] : undefined;
  return ms !== undefined && ms > 0 ? ms : null;
}
