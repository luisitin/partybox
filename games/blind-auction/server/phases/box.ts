// Phase "box": the mystery box lands with what it might hold — every content, its odds word and
// what a right call pays — read aloud. Lasts the reading plus a beat (at most 10 s), or 6 s with no
// voice; the VIP can skip to the betting. A late reading re-times the box; later than 3 s is
// dropped for this round (it would talk over the betting).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { boxRequest } from '../speech';
import { BOX_LEAD_MS, BOX_MAX_MS, BOX_SILENT_MS, BOX_TAIL_MS } from '../timing';
import type { Input, State, Transition } from '../types';

const VOICE_LATE_MS = 3_000;

function voicedEnd(startedAt: number, voiceAt: number, ms: number): number {
  return Math.min(startedAt + BOX_MAX_MS, voiceAt + ms + BOX_TAIL_MS);
}

export function enterBox(state: State, now: number, idx: number): State {
  const entered: State = {
    ...state,
    r: { idx, bets: {}, step: 0, voiceAt: null, turnedAt: null, topped: [] },
    notices: {},
  };
  const key = boxRequest(entered, idx)?.key;
  const ms = key ? entered.speechMs[key] : undefined;
  if (ms === undefined || ms < 0) return enterPhase(entered, 'box', now, BOX_SILENT_MS);
  const voiceAt = now + BOX_LEAD_MS;
  const phased = enterPhase(entered, 'box', now, voicedEnd(now, voiceAt, ms) - now);
  return { ...phased, r: { ...phased.r, voiceAt } };
}

/** ADR-045: the box's reading is ready. If it can still start in time, the box re-times to it. */
export function boxSpeech(state: State, key: string, ms: number, now: number): State {
  const { phase, r } = state;
  if (phase.id !== 'box' || phase.paused || r.voiceAt !== null || ms < 0) return state;
  if (boxRequest(state, r.idx)?.key !== key || now > phase.startedAt + VOICE_LATE_MS) return state;
  const voiceAt = Math.max(now, phase.startedAt + BOX_LEAD_MS);
  return {
    ...state,
    phase: { ...phase, deadline: voicedEnd(phase.startedAt, voiceAt, ms) },
    r: { ...r, voiceAt },
  };
}

export function reduceBox(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
