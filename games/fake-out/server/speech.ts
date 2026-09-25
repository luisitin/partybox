// What Fake-Out's reader says (SPEC §3.13) and when it is asked for (§3.5 "Speech", Part 00 §5.7):
// the fact (with "blank") from the intro or the scores before it; every option all together at
// `pick`, so the cache cannot single out the truth; the completed fact only once the truth step is
// on stage. The eight fixed lines are readings too, asked for at the intro (and cached for good).
// Pure: the host renders; `speechMs` records each length.
import type { SpeechPart, SpeechRequest } from '@partybox/game-sdk';
import { speechKey, toSpeakable } from '@partybox/game-sdk/speech';
import { BLANK } from '../content/schema';
import { PRONUNCIATIONS } from './content';
import { READERS } from './types';
import type { FactItem, Reader, State } from './types';

export const LINES = {
  question: "Here's your question.",
  lie: 'Time to fool your friends.',
  pick: 'Pick the truth.',
  itsALie: "It's a lie!",
  truth: "That's the truth!",
  nobody: 'Nobody found the truth.',
  house: 'A PartyBox lie!',
  final: 'Final Fake-Out. Double points!',
} as const;
export type LineId = keyof typeof LINES;
export const LINE_IDS = Object.keys(LINES) as LineId[];

function request(voice: string, parts: SpeechPart[]): SpeechRequest {
  return { key: speechKey('fake-out', voice, parts), voice, parts };
}

export function voiceOf(state: State): Reader | null {
  return state.cfg.reader === 'none' ? null : state.cfg.reader;
}

const said = (voice: string, text: string, itemId?: string, playerText = false): SpeechPart[] =>
  toSpeakable(text, { voice, lang: 'en', overrides: PRONUNCIATIONS, itemId, playerText });

export function factReading(voice: string, item: FactItem): SpeechRequest {
  return request(voice, said(voice, item.fact, item.id));
}

/** Every option is read in player-text mode — the truth too, so no reading sounds different. */
export function optionReading(voice: string, display: string): SpeechRequest {
  return request(voice, said(voice, display, undefined, true));
}

/** The fact with the truth in its blank: secret until the truth step. */
export function completedReading(voice: string, item: FactItem): SpeechRequest {
  return request(voice, said(voice, item.fact.replace(BLANK, item.truth.answer), item.id));
}

/** The fixed lines' requests for every voice, made once at import (views ask for them often). */
const LINE_REQUESTS: Readonly<Record<string, Readonly<Record<LineId, SpeechRequest>>>> =
  Object.fromEntries(
    READERS.map((voice) => [
      voice,
      Object.fromEntries(LINE_IDS.map((id) => [id, request(voice, said(voice, LINES[id]))])),
    ]),
  ) as Record<string, Record<LineId, SpeechRequest>>;

export function lineReading(voice: string, id: LineId): SpeechRequest {
  return LINE_REQUESTS[voice]?.[id] ?? request(voice, said(voice, LINES[id]));
}

/** Index of the completed-fact step: right after the last option step. */
export function factStep(state: State): number {
  return state.q.revealOrder.length;
}

/** Everything this state wants made that is not made yet (Part 00 §5.7: a round ahead, never a
 *  secret before its reveal). */
export function speech(state: State): SpeechRequest[] {
  const voice = voiceOf(state);
  if (!voice) return [];
  const phase = state.phase.id;
  // The host makes readings one at a time, in the order asked: what is needed first goes first
  // (the fact before the fixed lines, which wait until the lie; the options at the pick).
  const out: SpeechRequest[] = [];
  if (phase === 'intro' || phase === 'question' || phase === 'lie')
    out.push(factReading(voice, state.q.item));
  if (phase === 'intro') out.push(...LINE_IDS.map((id) => lineReading(voice, id)));
  if ((phase === 'pick' || phase === 'reveal') && state.q.options)
    out.push(...state.q.options.map((o) => optionReading(voice, o.display)));
  if (phase === 'reveal' && state.q.step >= factStep(state) - 1)
    out.push(completedReading(voice, state.q.item));
  const next = state.questions[state.q.n];
  if (phase === 'scores' && next && state.q.n < state.cfg.questions)
    out.push(factReading(voice, next));
  return out.filter((r) => state.speechMs[r.key] === undefined);
}

/** A reading's length: ms when made, null while it is still being made, −1 when it failed. */
export function readingMs(state: State, req: SpeechRequest | null): number | null {
  if (!req) return -1;
  const ms = state.speechMs[req.key];
  return ms === undefined ? null : ms;
}

/** How long a text takes to say without a voice (the room still waits for people to read it). */
export function estimateMs(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0).length;
  return 400 + words * 330;
}

/** A made reading's url, or null. Only ever put in a view at the moment it plays. */
export function readingUrl(state: State, req: SpeechRequest | null): string | null {
  const ms = readingMs(state, req);
  return req && ms !== null && ms >= 0 ? `/api/speech/${req.key}.wav` : null;
}
