// Echo's reader (§7.13, ADR-045). Live readings: the surviving clues when `guess` begins and
// "The word was …" when `result` begins. The fixed lines are asked for as readings too (cached by
// key on the host forever) until F6's render-clips pipeline exists — see NOTES.md. A key reaches
// a view only when its line plays; the word is never asked for before `result`.
import type { SpeechRequest } from '@partybox/game-sdk';
import { parsePronunciations, speechKey, toSpeakable } from '@partybox/game-sdk/speech';
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };
import { piles, ratingOf } from './deck';
import { echoedRefs, survivorTexts } from './echoes';
import type { State } from './types';

export const LINES = {
  clueTime: 'Clue time.',
  echo: 'Echo!',
  totalEcho: 'Total echo!',
  gotIt: 'Got it!',
  ohNo: 'Oh no.',
  pass: 'Pass.',
  swapped: 'Word swapped.',
  lastWord: 'Last word!',
  flawless: 'Flawless!',
  brilliant: 'Brilliant!',
  great: 'Great!',
  solid: 'Solid.',
  warming: 'Warming up.',
  again: 'Try again!',
} as const;
export type LineId = keyof typeof LINES;

/** The fixed lines worth rendering from the start (the ratings wait for the last word). */
const EARLY: readonly LineId[] = [
  'clueTime',
  'echo',
  'totalEcho',
  'gotIt',
  'ohNo',
  'pass',
  'lastWord',
  'swapped',
];

export interface Say {
  key: string;
  text: string;
  /** Length in ms once the host made it; -1 = no voice (show the text, carry on). */
  ms: number | null;
}

const OVERRIDES = parsePronunciations(pronunciationsJson);

function partsOf(voice: string, text: string) {
  return toSpeakable(text, { voice, lang: 'en', overrides: OVERRIDES, playerText: true });
}

/** The host key (SDK `speechKey`: game id + hash of engine version, voice and parts). */
export function keyOf(voice: string, text: string): string {
  return speechKey('echo', voice, partsOf(voice, text));
}

function voiceOf(state: State): string | null {
  return state.cfg.reader === 'none' ? null : state.cfg.reader;
}

function req(voice: string, text: string): SpeechRequest {
  return { key: keyOf(voice, text), voice, parts: partsOf(voice, text) };
}

export function survivorsLine(state: State): string {
  return survivorTexts(state)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => `${t.charAt(0).toUpperCase()}${t.slice(1)}.`)
    .join(' ');
}

export function wordLine(state: State): string {
  return `The word was ${state.w.word.answer}.`;
}

function ratingLine(state: State): LineId {
  return ratingOf(piles(state).won.length, state.deck.length);
}

/** What the reader says as this phase begins, in order (empty with no reader). */
export function sayNow(state: State): Say[] {
  const voice = voiceOf(state);
  if (!voice) return [];
  const say = (text: string): Say => {
    const key = keyOf(voice, text);
    return { key, text, ms: state.speechMs[key] ?? null };
  };
  const phase = state.phase.id;
  const w = state.w;
  if (phase === 'clue') {
    if (w.swaps > 0) return [say(LINES.swapped)];
    if (w.idx === state.deck.length - 1) return [say(LINES.lastWord)];
    return w.idx === 0 ? [say(LINES.clueTime)] : [];
  }
  if (phase === 'guess') {
    const line = survivorsLine(state);
    const echoes = echoedRefs(state).length > 0;
    if (!line) return echoes ? [say(LINES.totalEcho)] : [];
    return echoes ? [say(LINES.echo), say(line)] : [say(line)];
  }
  if (phase === 'result' && w.guess) {
    const outcome =
      w.guess.result === 'right'
        ? LINES.gotIt
        : w.guess.result === 'wrong'
          ? LINES.ohNo
          : LINES.pass;
    return [say(wordLine(state)), say(outcome)];
  }
  if (phase === 'done') return [say(LINES[ratingLine(state)])];
  return [];
}

/** ADR-045: every reading this state wants made, ahead of its moment; at most ~10 pending. */
export function speech(state: State): SpeechRequest[] {
  const voice = voiceOf(state);
  if (!voice) return [];
  const want: string[] = EARLY.map((id) => LINES[id]);
  const phase = state.phase.id;
  // Prefetch the likely survivors while the clue-givers check them; the final set at `guess`.
  if (phase === 'check' || phase === 'guess') {
    const line = survivorsLine(state);
    if (line) want.push(line);
  }
  if (phase === 'result') want.push(wordLine(state));
  const lastResult = phase === 'result' && piles(state).left === 0;
  if (lastResult || phase === 'done') want.push(LINES[ratingLine(state)]);
  return want.map((text) => req(voice, text)).filter((r) => state.speechMs[r.key] === undefined);
}

/** The survivors' reading length, once the host has made it (null without a reader). */
export function readingMs(state: State): number | null {
  const voice = voiceOf(state);
  const line = survivorsLine(state);
  if (!voice || !line) return null;
  return state.speechMs[keyOf(voice, line)] ?? null;
}

export function applySpeech(state: State, key: string, ms: number): State {
  if (state.speechMs[key] === ms) return state;
  return { ...state, speechMs: { ...state.speechMs, [key]: ms } };
}
