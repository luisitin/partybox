// Phase "lot": the face-down card, its name, flavour line and hint, read aloud. Lasts the reading
// plus a beat (at most 10 s), or 6 s with no voice; the VIP can skip to the bidding. The reading is
// usually made during the previous flip; one that arrives late re-times the card, and one later
// than 3 s in is dropped for this lot (it would talk over the bidding).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { lotRequest } from '../speech';
import { LOT_LEAD_MS, LOT_MAX_MS, LOT_SILENT_MS, LOT_TAIL_MS } from '../timing';
import type { Input, State, Transition } from '../types';

/** A reading later than this into the lot is not played. */
const VOICE_LATE_MS = 3_000;

function freshLot(idx: number, now: number): State['l'] {
  return {
    idx,
    bids: {},
    high: null,
    stage: 0,
    openedAt: now,
    winner: null,
    price: 0,
    tie: false,
    step: 0,
    effect: null,
    voiceAt: null,
  };
}

/** The lot's length once its voice starts at `voiceAt` and runs `ms`. */
function voicedEnd(startedAt: number, voiceAt: number, ms: number): number {
  return Math.min(startedAt + LOT_MAX_MS, voiceAt + ms + LOT_TAIL_MS);
}

export function enterLot(state: State, now: number, idx: number): State {
  const entered: State = { ...state, l: freshLot(idx, now), notices: {} };
  const key = lotRequest(entered, idx)?.key;
  const ms = key ? entered.speechMs[key] : undefined;
  if (ms === undefined || ms < 0) return enterPhase(entered, 'lot', now, LOT_SILENT_MS);
  const voiceAt = now + LOT_LEAD_MS;
  const phased = enterPhase(entered, 'lot', now, voicedEnd(now, voiceAt, ms) - now);
  return { ...phased, l: { ...phased.l, voiceAt } };
}

/** ADR-045: the lot's reading is ready. If it can still start in time, the card re-times to it. */
export function lotSpeech(state: State, key: string, ms: number, now: number): State {
  const { phase, l } = state;
  if (phase.id !== 'lot' || phase.paused || l.voiceAt !== null || ms < 0) return state;
  if (lotRequest(state, l.idx)?.key !== key || now > phase.startedAt + VOICE_LATE_MS) return state;
  const voiceAt = Math.max(now, phase.startedAt + LOT_LEAD_MS);
  return {
    ...state,
    phase: { ...phase, deadline: voicedEnd(phase.startedAt, voiceAt, ms) },
    l: { ...l, voiceAt },
  };
}

export function reduceLot(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
