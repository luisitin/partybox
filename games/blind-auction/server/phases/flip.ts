// Phase "flip" (SPEC §8.4): the card turns and the outcome lands; coins move. Unsold lots flip
// too, so the room sees what it missed (nobody gains or loses). Two beats (ADR-033): step 0 while
// the card turns, step 1 once the outcome is up — the phones get their own line then. The amount
// reading ("Plus three hundred!") is requested only now; it plays after the fixed line if it is
// ready by 3.5 s in, and the card waits for it (never more than 6 s extra). Ends ~6 s, or the VIP.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { applyOutcome } from '../outcome';
import { fixedRequest, flipLine, flipRequest } from '../speech';
import {
  FLIP_HOLD_MS,
  FLIP_LINE_AT_MS,
  FLIP_TURN_MS,
  FLIP_VOICE_MAX_MS,
  VOICE_BEAT_MS,
} from '../timing';
import type { Input, State, Transition } from '../types';

/** A reading later than this into the flip is not played. */
const VOICE_LATE_MS = 3_500;

export function enterFlip(state: State, now: number): State {
  const flipped = applyOutcome({ ...state, l: { ...state.l, step: 0, voiceAt: null } });
  return enterPhase(flipped, 'flip', now, FLIP_TURN_MS);
}

/** When the amount reading may start: after the fixed line has been said. */
function readingAt(state: State, now: number): number {
  const line = flipLine(state);
  const key = line ? fixedRequest(state, line)?.key : undefined;
  const lineMs = key ? (state.speechMs[key] ?? 0) : 0;
  return Math.max(now, state.phase.startedAt + FLIP_LINE_AT_MS + Math.max(0, lineMs) + 150);
}

/** ADR-045: the amount reading is ready; if it is not too late, it plays and the card waits. */
export function flipSpeech(state: State, key: string, ms: number, now: number): State {
  const { phase, l } = state;
  if (phase.id !== 'flip' || phase.paused || l.voiceAt !== null || ms < 0) return state;
  if (flipRequest(state)?.key !== key || now > phase.startedAt + VOICE_LATE_MS) return state;
  const voiced: State = { ...state, l: { ...l, voiceAt: readingAt(state, now) } };
  if (l.step === 0 || phase.deadline === null) return voiced; // step 1 will wait for it
  return { ...voiced, phase: { ...phase, deadline: Math.max(phase.deadline, voiceEnd(voiced)) } };
}

/** When the amount reading (if any) and a beat after it are over. */
function voiceEnd(state: State): number {
  const key = flipRequest(state)?.key;
  const ms = key ? (state.speechMs[key] ?? -1) : -1;
  if (state.l.voiceAt === null || ms < 0) return 0;
  const cap = state.phase.startedAt + FLIP_TURN_MS + FLIP_HOLD_MS + FLIP_VOICE_MAX_MS;
  return Math.min(cap, state.l.voiceAt + ms + VOICE_BEAT_MS);
}

export function reduceFlip(state: State, event: GameEvent<Input>, next: Transition): State {
  if (!isTimerFor(state, event)) return state;
  if (state.l.step === 1) return next(state, event.now);
  // Step 1: the outcome is up; the card stays for the hold, or until the reading is over.
  const deadline = Math.max(event.now + FLIP_HOLD_MS, voiceEnd(state));
  return { ...state, phase: { ...state.phase, deadline }, l: { ...state.l, step: 1 } };
}
