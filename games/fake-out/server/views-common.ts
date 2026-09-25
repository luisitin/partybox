// What both views share: the fact split around its blank (the truth fills it only from the
// completed-fact step on), the reveal as far as the TV has shown it, the reading on stage now, and
// the standings. Secrets (authors, house, truth, picks) appear only for steps already on stage.
import { BLANK } from '../content/schema';
import { pickersOf, unpickedLies } from './options';
import { factStartMs, optionOnStep, stepTiming } from './pacing';
import { multiplier, standings } from './scoring';
import {
  LINE_IDS,
  completedReading,
  estimateMs,
  factReading,
  factStep,
  lineReading,
  optionReading,
  readingUrl,
  voiceOf,
} from './speech';
import type { LineId } from './speech';
import { FOOL_POINTS, TRUTH_POINTS } from './types';
import type { State, Why } from './types';

export interface FactView {
  before: string;
  after: string;
  /** The truth in its blank: only from the completed-fact step on. */
  truth: string | null;
  category: string;
}

export interface RevealedOption {
  id: string;
  display: string;
  stamp: 'lie' | 'house' | 'truth';
  pickers: string[];
  authors: string[];
  /** Points each author (a lie) or each finder (the truth) gets from this card. */
  each: number;
  likes: number;
}

export interface RevealView {
  step: number;
  /** Server time the step on stage began; beats run from here. */
  stepAt: number;
  kind: 'option' | 'fact' | 'unpicked';
  /** Option steps: when the stamp lands, ms after `stepAt`. */
  stampMs: number;
  /** Options already flipped, the one on stage last. */
  shown: RevealedOption[];
  /** The "Nobody fell for…" strip, at its step only. */
  unpicked: { display: string; authors: string[] }[];
  /** How many option steps the reveal has (lies picked + the truth). */
  total: number;
}

export interface StandingView {
  playerId: string;
  score: number;
  rank: number;
  delta: number;
  why: Why[];
}

export function truthShown(state: State): boolean {
  if (state.phase.id === 'scores' || state.phase.id === 'done') return state.q.options !== null;
  return state.phase.id === 'reveal' && state.q.step >= factStep(state);
}

export function factView(state: State): FactView {
  const [before = '', after = ''] = state.q.item.fact.split(BLANK);
  return {
    before,
    after,
    truth: truthShown(state) ? state.q.item.truth.answer : null,
    category: state.q.item.category,
  };
}

function likesOn(state: State, id: string): number {
  return Object.values(state.q.likes).filter((ids) => ids.includes(id)).length;
}

export function revealView(state: State): RevealView | null {
  if (state.phase.id !== 'reveal') return null;
  const { q } = state;
  const timing = stepTiming(state, q.step);
  const mult = multiplier(state);
  const shown: RevealedOption[] = [];
  for (let s = 0; s <= q.step && s < q.revealOrder.length; s++) {
    const o = optionOnStep(state, s);
    if (!o) continue;
    const pickers = pickersOf(state, o.id);
    shown.push({
      id: o.id,
      display: o.display,
      stamp: o.truth ? 'truth' : o.house ? 'house' : 'lie',
      pickers,
      authors: o.authors,
      each: o.truth ? TRUTH_POINTS * mult : o.house ? 0 : FOOL_POINTS * pickers.length * mult,
      likes: likesOn(state, o.id),
    });
  }
  return {
    step: q.step,
    stepAt: q.stepAt,
    kind: timing?.kind ?? 'fact',
    stampMs: timing?.stampMs ?? 0,
    shown,
    unpicked:
      timing?.kind === 'unpicked'
        ? unpickedLies(state).map((o) => ({ display: o.display, authors: o.authors }))
        : [],
    total: q.revealOrder.length,
  };
}

export interface ReadingView {
  url: string;
  /** Server time it should start. */
  at: number;
}

/** The live reading that belongs to this moment, once made — never earlier (Part 00 §5.7). */
export function readingNow(state: State): ReadingView | null {
  const voice = voiceOf(state);
  if (!voice) return null;
  const { phase, q } = state;
  if (phase.id === 'question') {
    const url = readingUrl(state, factReading(voice, q.item));
    return url ? { url, at: q.readAt || phase.startedAt + factStartMs(state) } : null;
  }
  if (phase.id !== 'reveal') return null;
  const option = optionOnStep(state, q.step);
  const req = option
    ? optionReading(voice, option.display)
    : q.step === factStep(state)
      ? completedReading(voice, q.item)
      : null;
  const url = req ? readingUrl(state, req) : null;
  return url ? { url, at: q.stepAt } : null;
}

/** The read-along for the text on stage: when it starts (server time) and how long it takes —
 *  the voice's length when made, the reading-time estimate with no voice (or a failed one);
 *  'waiting' while the voice is still being made. Null when nothing is being read. */
export type ReadAlongView = { at: number; ms: number } | 'waiting' | null;

export function readAlongNow(state: State): ReadAlongView {
  const voice = voiceOf(state);
  const { phase, q } = state;
  const timed = (
    req: ReturnType<typeof factReading> | null,
    text: string,
    at: number,
  ): ReadAlongView => {
    if (!req) return { at, ms: estimateMs(text) };
    const ms = state.speechMs[req.key];
    if (ms === undefined) return 'waiting';
    return { at, ms: ms >= 0 ? ms : estimateMs(text) };
  };
  if (phase.id === 'question')
    return timed(
      voice ? factReading(voice, q.item) : null,
      q.item.fact,
      q.readAt || phase.startedAt + factStartMs(state),
    );
  if (phase.id !== 'reveal') return null;
  const option = optionOnStep(state, q.step);
  if (option)
    return timed(voice ? optionReading(voice, option.display) : null, option.display, q.stepAt);
  if (q.step === factStep(state))
    return timed(voice ? completedReading(voice, q.item) : null, q.item.fact, q.stepAt);
  return null;
}

/** After the phase chime, before a spoken line: the chime and the voice never land together. */
export const LINE_AFTER_CHIME_MS = 450;

/** The fixed line that opens this moment, once made: "Here's your question." on the first card,
 *  "Final Fake-Out. Double points!" on the last, "Time to fool your friends." as the lie opens,
 *  "Pick the truth." as the pick opens. */
export function leadNow(state: State): ReadingView | null {
  const voice = voiceOf(state);
  if (!voice) return null;
  const { phase, q } = state;
  const id: LineId | null =
    phase.id === 'question'
      ? q.final
        ? 'final'
        : q.n === 1
          ? 'question'
          : null
      : phase.id === 'lie'
        ? 'lie'
        : phase.id === 'pick'
          ? 'pick'
          : null;
  const url = id ? readingUrl(state, lineReading(voice, id)) : null;
  if (!url) return null;
  return { url, at: phase.startedAt + (phase.id === 'question' ? 0 : LINE_AFTER_CHIME_MS) };
}

/** The fixed lines that are made, by id (not secret: the same eight every game). */
export function linesReady(state: State): Partial<Record<LineId, string>> {
  const voice = voiceOf(state);
  const out: Partial<Record<LineId, string>> = {};
  if (!voice) return out;
  for (const id of LINE_IDS) {
    const url = readingUrl(state, lineReading(voice, id));
    if (url) out[id] = url;
  }
  return out;
}

export function standingsView(state: State): StandingView[] {
  return standings(state).map((r) => ({ ...r }));
}
