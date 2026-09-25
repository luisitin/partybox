// READER-VOICES (ADR-045, SPEC §9.17): the clue read aloud ("Ocean, three.") plus the fixed lines.
// STAND-IN: until F6 ships `toSpeakable` and the render-clips pipeline, the fixed lines are ordinary
// readings prefetched at the start (nothing Spy Grid says is secret before it plays, and a key only
// reaches a view when its line plays), and `speakable` below does the few rewrites Spy Grid needs.
import type { SpeechPart, SpeechRequest } from '@partybox/game-sdk';
import { PRONUNCIATIONS } from './content';
import type { State, Team } from './types';

const ENGINE = 'v1';
const NUMBER_WORDS = [
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
];

export const LINES = {
  sunFirst: 'Sun goes first.',
  moonFirst: 'Moon goes first.',
  sunTurn: 'Suns turn.',
  moonTurn: 'Moons turn.',
  sun: 'Agent!',
  moon: 'Agent!',
  enemy: 'Enemy agent!',
  bystander: 'Bystander.',
  assassin: 'Assassin!',
  noClue: 'No clue!',
  outOfGuesses: 'Out of guesses.',
  sunWins: 'Sun wins!',
  moonWins: 'Moon wins!',
  draw: 'Its a draw.',
  missionComplete: 'Mission complete!',
  missionFailed: 'Mission failed.',
} as const;
export type LineId = keyof typeof LINES;

/** A stable key (FNV-1a twice over engine version, voice and parts; Part 00 ruling 17). */
export function speechKey(voice: string, parts: readonly SpeechPart[]): string {
  const text = `${ENGINE}|${voice}|${JSON.stringify(parts)}`;
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
  }
  return `sg${a.toString(36)}${b.toString(36)}`;
}

/** The part of `toSpeakable` a clue needs: quotes, case (never spelled out), a respelling. */
export function speakable(word: string): string {
  const clean = word
    .replace(/[’‘ʼ´`]/g, "'")
    .replace(/[“”"]/g, '')
    .toLowerCase();
  const fix = PRONUNCIATIONS[clean];
  // Any letter survives (CANCIÓN, ÑANDÚ), so a Spanish clue reaches the reader whole (session-c).
  return (fix?.say ?? clean).replace(/[^\p{L}' -]/gu, '');
}

export function voiceOf(state: State): string | null {
  const reader = state.settings.reader;
  return reader === 'none' || reader === '' ? null : reader;
}

function request(voice: string, text: string): SpeechRequest {
  const parts = [{ text }];
  return { key: speechKey(voice, parts), voice, parts };
}

export function lineRequest(state: State, id: LineId): SpeechRequest | null {
  const voice = voiceOf(state);
  return voice ? request(voice, LINES[id]) : null;
}

export function clueRequest(state: State): SpeechRequest | null {
  const voice = voiceOf(state);
  const clue = state.turn.clue;
  if (!voice || !clue) return null;
  const word = speakable(clue.word);
  const said = `${word.charAt(0).toUpperCase()}${word.slice(1)}, ${NUMBER_WORDS[clue.number] ?? ''}.`;
  return request(voice, said);
}

/** The line for the card being flipped, from the flipping team's point of view. */
export function flipLine(state: State): SpeechRequest | null {
  const flip = state.turn.flip;
  if (!flip) return null;
  if (flip.kind === 'assassin' || flip.kind === 'bystander') return lineRequest(state, flip.kind);
  return lineRequest(state, flip.kind === state.turn.team ? flip.kind : 'enemy');
}

export const turnLine = (team: Team): LineId => (team === 'sun' ? 'sunTurn' : 'moonTurn');
export const firstLine = (team: Team): LineId => (team === 'sun' ? 'sunFirst' : 'moonFirst');

export function winLine(state: State): LineId {
  if (state.mode === 'coop') return state.winner === 'sun' ? 'missionComplete' : 'missionFailed';
  return state.winner === 'sun' ? 'sunWins' : state.winner === 'moon' ? 'moonWins' : 'draw';
}

const BASE: readonly LineId[] = [
  'sunTurn',
  'moonTurn',
  'sun',
  'enemy',
  'bystander',
  'assassin',
  'noClue',
  'outOfGuesses',
];
const ENDS: readonly LineId[] = ['sunWins', 'moonWins', 'draw', 'missionComplete', 'missionFailed'];

/** Every reading this state wants that the host has not answered yet (≤ 10 at a time). */
export function speech(state: State): SpeechRequest[] {
  if (!voiceOf(state)) return [];
  const want: LineId[] = [firstLine(state.starter), ...BASE];
  const known = (r: SpeechRequest | null): boolean =>
    r === null || state.speechMs[r.key] !== undefined;
  if (want.every((id) => known(lineRequest(state, id)))) want.push(...ENDS);
  const out = want.map((id) => lineRequest(state, id));
  out.unshift(clueRequest(state));
  return out.filter((r): r is SpeechRequest => r !== null && !known(r)).slice(0, 10);
}
