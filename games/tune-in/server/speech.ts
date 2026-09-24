// READER-VOICES (ADR-045, spec §5.13): what the reader says, and when it is asked for. Live: the
// psychic and the dial's ends at `clue`, the clue itself at `dial`. Fixed lines ride the same path
// (the host caches every key) until F6's clip renderer exists (NOTES.md). A key reaches a view only
// in the phase its line plays; the target is never spoken.
import type { SpeechRequest } from '@partybox/game-sdk';
import { PRONUNCIATIONS } from './content';
import { bandPoints, coopRating, isPerfectTune, roundedAverage } from './scoring';
import { readableName, speakableText, speechKey, toParts } from './speakable';
import { earnsCatchUp, guessersOf, isOver, planTurn } from './turn';
import type { Reader, State } from './types';

export const FIXED = {
  tuneIn: 'Tune in!',
  newPsychic: 'New psychic.',
  lockIn: 'Lock it in.',
  leftOrRight: 'Left or right?',
  bullseye: 'Bullseye!',
  close: 'Close!',
  missed: 'Missed it.',
  perfect: 'Perfect tune!',
  catchUp: 'Catch-up! Go again.',
  static: 'Static.',
  tuning: 'Tuning in.',
  clear: 'Crystal clear!',
  meld: 'Mind meld!',
} as const;
export type LineId = keyof typeof FIXED;

/** P00 §5.7: never more than this many readings pending at once. */
const MAX_PENDING = 10;

export function voiceOf(state: State): Reader | null {
  return state.cfg.reader === 'none' ? null : state.cfg.reader;
}

function request(voice: Reader, text: string): SpeechRequest {
  const parts = toParts(text, PRONUNCIATIONS);
  return { key: speechKey(voice, parts), voice, parts };
}

export function fixedReading(state: State, line: LineId): SpeechRequest | null {
  const voice = voiceOf(state);
  return voice ? request(voice, FIXED[line]) : null;
}

/** "Ana is the psychic. From cold, to hot." (or "New psychic." when the name can't be read). */
export function announceReading(state: State): SpeechRequest | null {
  const voice = voiceOf(state);
  const spectrum = state.spectra[state.turn.spectrum];
  if (!voice || !spectrum || !state.turn.psychic) return null;
  const name = readableName(state.players[state.turn.psychic]?.name ?? '');
  const who = name ? `${name} is the psychic.` : FIXED.newPsychic;
  const ends = `From ${speakableText(spectrum.left, false)}, to ${speakableText(spectrum.right, false)}.`;
  return request(voice, `${who} ${ends}`);
}

/** The clue itself ("Coffee."), asked for the moment the psychic sends it. */
export function clueReading(state: State): SpeechRequest | null {
  const voice = voiceOf(state);
  const clue = state.turn.clue ? speakableText(state.turn.clue, true) : '';
  if (!voice || !clue) return null;
  const said = clue.charAt(0).toUpperCase() + clue.slice(1);
  return request(voice, /[.!?]$/.test(said) ? said : `${said}.`);
}

/** The reveal's verdict: Perfect tune (solo), else the best dial's (or the needle's) band. */
export function verdictLine(state: State): LineId | null {
  const { turn } = state;
  if (turn.void) return null;
  if (isPerfectTune(state)) return 'perfect';
  // Solo: the room's average (what the psychic scores), so a Bullseye! means the room tuned in —
  // one lucky dial among many is still only "Close!". Teams and co-op: the needle's band.
  let pts = 0;
  if (state.mode === 'solo')
    pts = roundedAverage(
      guessersOf(state)
        .filter((id) => Object.hasOwn(turn.dials, id))
        .map((id) => turn.points[id] ?? 0),
    );
  else if (turn.needle !== null) pts = bandPoints(turn.needle - turn.target, state.cfg.targetSize);
  if (pts === 4) return 'bullseye';
  return pts >= 2 ? 'close' : 'missed';
}

export function verdictReading(state: State): SpeechRequest | null {
  const line = verdictLine(state);
  return line ? fixedReading(state, line) : null;
}

export function ratingLine(state: State): LineId {
  return coopRating(state.coopTotal, state.played);
}

/** The next turn's announcement, read ahead during `reveal` / `scores` (P00 §5.7). */
function upcomingAnnounce(state: State): SpeechRequest | null {
  if (isOver(state)) return null;
  return announceReading(planTurn(state, earnsCatchUp(state)));
}

/** Every reading this state wants, in the order it will need them, minus the ones already made. */
export function speech(state: State): SpeechRequest[] {
  if (!voiceOf(state)) return [];
  const teams = state.mode === 'teams';
  const verdicts = (['bullseye', 'close', 'missed', 'perfect'] as const)
    .filter((l) => l !== 'perfect' || state.mode === 'solo')
    .map((l) => fixedReading(state, l));
  const wanted: (SpeechRequest | null)[] = [];
  switch (state.phase.id) {
    case 'intro':
      wanted.push(fixedReading(state, 'tuneIn'), announceReading(state));
      wanted.push(fixedReading(state, 'lockIn'));
      break;
    case 'clue':
      wanted.push(announceReading(state), fixedReading(state, 'lockIn'), ...verdicts);
      if (teams) wanted.push(fixedReading(state, 'leftOrRight'));
      break;
    case 'dial':
      wanted.push(clueReading(state), fixedReading(state, 'lockIn'), ...verdicts);
      if (teams) wanted.push(fixedReading(state, 'leftOrRight'), fixedReading(state, 'catchUp'));
      break;
    case 'call':
      wanted.push(fixedReading(state, 'leftOrRight'), ...verdicts, fixedReading(state, 'catchUp'));
      break;
    case 'reveal':
    case 'scores':
      wanted.push(verdictReading(state), upcomingAnnounce(state));
      if (teams) wanted.push(fixedReading(state, 'catchUp'));
      if (state.mode === 'coop' && isOver(state))
        wanted.push(fixedReading(state, ratingLine(state)));
      break;
    case 'done':
      if (state.mode === 'coop') wanted.push(fixedReading(state, ratingLine(state)));
      break;
  }
  const seen = new Set<string>();
  return wanted
    .filter((r): r is SpeechRequest => r !== null)
    .filter((r) => !seen.has(r.key) && seen.add(r.key) && state.speechMs[r.key] === undefined)
    .slice(0, MAX_PENDING);
}

/** A reading a view may carry: only once the host has made it (a failed one is never offered). */
export function playable(
  state: State,
  req: SpeechRequest | null,
): { key: string; url: string } | null {
  if (!req) return null;
  const ms = state.speechMs[req.key];
  return ms !== undefined && ms >= 0 ? { key: req.key, url: `/api/speech/${req.key}.wav` } : null;
}

/** The line the stage plays in this phase (null when there is none or it is not ready). */
export function stageReading(state: State): { key: string; url: string } | null {
  const { turn } = state;
  switch (state.phase.id) {
    case 'intro':
      return playable(state, fixedReading(state, 'tuneIn'));
    case 'clue':
      return playable(state, announceReading(state));
    case 'dial':
      return playable(state, clueReading(state));
    case 'call':
      return playable(state, fixedReading(state, 'leftOrRight'));
    case 'reveal':
      return turn.step === 1 ? playable(state, verdictReading(state)) : null;
    case 'scores':
      return !isOver(state) && earnsCatchUp(state)
        ? playable(state, fixedReading(state, 'catchUp'))
        : null;
    case 'done':
      return state.mode === 'coop' ? playable(state, fixedReading(state, ratingLine(state))) : null;
    default:
      return null;
  }
}
