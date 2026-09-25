// How long each voiced moment holds (SPEC §3.12): the question card for its reading plus a beat;
// each reveal step for its reading, the stamp beat and the points beat, clamped to 2.5–4.5 s; the
// completed fact for its reading plus 2 s; "Nobody fell for…" for 1.5 s. A reading still being
// made holds its moment at most VOICE_WAIT_MS — a stuck voice never holds the room.
import {
  optionReading,
  completedReading,
  estimateMs,
  factReading,
  lineReading,
  readingMs,
  voiceOf,
} from './speech';
import { unpickedLies } from './options';
import {
  FACT_HOLD_MS,
  POINTS_MS,
  QUESTION_BEAT_MS,
  QUESTION_MAX_MS,
  STAMP_MS,
  STEP_MAX_MS,
  STEP_MIN_MS,
  UNPICKED_MS,
  VOICE_WAIT_MS,
} from './types';
import type { OptionEntry, State } from './types';

/** The gap between the lead-in line ("Final Fake-Out…") and the fact. */
export const LEAD_GAP_MS = 250;

/** ms of a spoken moment: its reading when made, the estimate when there is no voice or it
 *  failed, null while it is still being made. */
function spokenMs(
  state: State,
  text: string,
  req: ReturnType<typeof factReading> | null,
): number | null {
  if (!req) return estimateMs(text);
  const ms = readingMs(state, req);
  if (ms === null) return null;
  return ms >= 0 ? ms : estimateMs(text);
}

/** The lead-in before the fact: the Final Fake-Out line, or "Here's your question." on the first
 *  question; 0 when there is none or it is not made. */
export function leadMs(state: State): number {
  const voice = voiceOf(state);
  const id = state.q.final ? 'final' : state.q.n === 1 ? 'question' : null;
  if (!voice || !id) return 0;
  const ms = readingMs(state, lineReading(voice, id));
  return ms !== null && ms > 0 ? ms + LEAD_GAP_MS : 0;
}

/** Where the fact reading starts, from the phase start. */
export function factStartMs(state: State): number {
  return leadMs(state);
}

/** The question card's length from its start: lead + reading + 1 s, at most 12 s. */
export function questionMs(state: State): number {
  const voice = voiceOf(state);
  const req = voice ? factReading(voice, state.q.item) : null;
  const ms = spokenMs(state, state.q.item.fact, req);
  if (ms === null) return QUESTION_MAX_MS;
  return Math.min(QUESTION_MAX_MS, Math.max(4_000, factStartMs(state) + ms + QUESTION_BEAT_MS));
}

export function optionOnStep(state: State, step: number): OptionEntry | null {
  const id = state.q.revealOrder[step];
  return (id && state.q.options?.find((o) => o.id === id)) || null;
}

/** An option step's reading length (null while being made). */
function optionMs(state: State, option: OptionEntry): number | null {
  const voice = voiceOf(state);
  return spokenMs(state, option.display, voice ? optionReading(voice, option.display) : null);
}

export interface StepTiming {
  kind: 'option' | 'fact' | 'unpicked';
  /** Length of the step. */
  ms: number;
  /** Option steps: when the stamp lands, from the step start. */
  stampMs: number;
}

/** The timing of reveal step `step`, or null when the reveal is over. */
export function stepTiming(state: State, step: number): StepTiming | null {
  const option = optionOnStep(state, step);
  if (option) {
    const reading = optionMs(state, option);
    if (reading === null)
      return { kind: 'option', ms: VOICE_WAIT_MS, stampMs: VOICE_WAIT_MS - POINTS_MS };
    const ms = Math.min(STEP_MAX_MS, Math.max(STEP_MIN_MS, reading + STAMP_MS + POINTS_MS));
    const stampMs = Math.min(ms - 1_000, Math.max(STAMP_MS, reading + STAMP_MS));
    return { kind: 'option', ms, stampMs };
  }
  const factAt = state.q.revealOrder.length;
  if (step === factAt) {
    const voice = voiceOf(state);
    const item = state.q.item;
    const said = spokenMs(state, item.fact, voice ? completedReading(voice, item) : null);
    return { kind: 'fact', ms: said === null ? VOICE_WAIT_MS : said + FACT_HOLD_MS, stampMs: 0 };
  }
  if (step === factAt + 1 && unpickedLies(state).length > 0)
    return { kind: 'unpicked', ms: UNPICKED_MS, stampMs: 0 };
  return null;
}
