// Paced reveal steps (NOTES decision 2): dawn, verdict, the hunter's shot and last words stay in
// their phase with later deadlines (ADR-033 beats). Each step lasts at least its visual minimum and
// as long as its reading plus a beat. The voice lands on the frame its words do (p02: a live line
// takes Kokoro 2–7 s): a step holds — up to HOLD_NEXT_MS — until the NEXT step's reading is ready,
// so the next step's words and voice arrive together. A reading that is late anyway re-times its
// step when it lands.
import { VOICE_BEAT_MS, readingNow, tonightsDeaths } from './speech';
import type { State } from './types';

/** The longest a step waits for the next step's reading. */
export const HOLD_NEXT_MS = 6_000;

/** The shortest time each step stays up, by phase and step. */
export function stepMin(state: State): number | null {
  const step = state.step;
  switch (state.phase.id) {
    case 'dawn':
      return [2_600, 3_400, 3_200][step] ?? null;
    case 'verdict': {
      const ballots = state.verdict?.ballots.length ?? 0;
      return [Math.min(5_200, 1_800 + ballots * 260), 2_800, 3_400][step] ?? null;
    }
    case 'hunter':
      return step === 1 ? 4_600 : null;
    case 'last-words':
      return step === 1 ? 5_200 : null;
    default:
      return null;
  }
}

/** The step that follows this one inside the phase, or null. */
export function nextStep(state: State): number | null {
  const step = state.step;
  switch (state.phase.id) {
    case 'dawn':
      if (step === 0) return 1;
      return step === 1 && state.cfg.revealRoles && tonightsDeaths(state).length > 0 ? 2 : null;
    case 'verdict':
      if (step === 0) return 1;
      return step === 1 && state.cfg.revealRoles && state.verdict?.out ? 2 : null;
    case 'hunter':
      return step === 0 && state.shot ? 1 : null;
    default:
      return null;
  }
}

/** This step's own time: its minimum, or its reading and a beat once the length is known. */
function ownMs(state: State, min: number): number {
  const r = readingNow(state);
  const ms = r ? state.speechMs[r.key] : undefined;
  return ms !== undefined && ms >= 0 ? Math.max(min, ms + VOICE_BEAT_MS) : min;
}

/** The next step's reading is asked for but not made yet. */
function waitingForNext(state: State): boolean {
  const next = nextStep(state);
  if (next === null) return false;
  const r = readingNow({ ...state, step: next });
  return r !== null && state.speechMs[r.key] === undefined;
}

/** When the current step may end, from its start. */
export function stepStay(state: State, min: number): number {
  const own = ownMs(state, min);
  return waitingForNext(state) ? Math.max(own, HOLD_NEXT_MS) : own;
}

/** Moves to `step` now; its deadline follows the step's reading (and the next one's). */
export function enterStep(state: State, now: number, step: number): State {
  const at: State = { ...state, step, stepAt: now };
  const min = stepMin(at);
  const ms = min === null ? null : stepStay(at, min);
  return { ...at, phase: { ...at.phase, deadline: ms === null ? null : now + ms } };
}

/** ADR-045: a reading is ready (or failed). The step on stage re-times: its own reading starts
 *  on the TV now (it lasts until that ends, and a beat); the next step's being ready lets the step
 *  end as soon as its own time is up. */
export function applySpeech(state: State, key: string, ms: number, now: number): State {
  if (state.speechMs[key] === ms) return state;
  const next: State = { ...state, speechMs: { ...state.speechMs, [key]: ms } };
  // The hunter has shot and the line has arrived: the shot lands now.
  if (next.phase.id === 'hunter' && next.step === 0 && next.shot && !next.phase.paused) {
    const line = readingNow({ ...next, step: 1 });
    if (line?.key === key) return { ...next, phase: { ...next.phase, deadline: now + 60 } };
  }
  const min = stepMin(next);
  if (min === null || next.phase.deadline === null || next.phase.paused) return next;
  const own = readingNow(next)?.key === key;
  const step = nextStep(next);
  const upcoming = step !== null && readingNow({ ...next, step })?.key === key;
  if (!own && !upcoming) return next;
  let until = next.stepAt + stepStay(next, min);
  if (own && ms >= 0) until = Math.max(until, now + ms + VOICE_BEAT_MS);
  return { ...next, phase: { ...next.phase, deadline: Math.max(until, now + 60) } };
}
