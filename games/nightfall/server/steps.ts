// Paced reveal steps (NOTES decision 2): dawn, verdict, the hunter's shot and last words stay in
// their phase with later deadlines (ADR-033 beats). Each step lasts at least its visual minimum,
// and as long as its reading plus a beat when the narrator speaks.
import { VOICE_BEAT_MS, readingNow, stayMs } from './speech';
import type { State } from './types';

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
    case 'lastWords':
      return step === 1 ? 5_200 : null;
    default:
      return null;
  }
}

/** Moves to `step` now; its deadline follows the step's reading. */
export function enterStep(state: State, now: number, step: number): State {
  const at: State = { ...state, step, stepAt: now };
  const min = stepMin(at);
  const ms = min === null ? null : stayMs(at, min);
  return { ...at, phase: { ...at.phase, deadline: ms === null ? null : now + ms } };
}

/** ADR-045: a reading is ready (or failed). If it is the reading of the step on stage, the TV
 *  starts it now, so the step lasts until it has finished and a beat (never under its minimum). */
export function applySpeech(state: State, key: string, ms: number, now: number): State {
  if (state.speechMs[key] === ms) return state;
  const next: State = { ...state, speechMs: { ...state.speechMs, [key]: ms } };
  const min = stepMin(next);
  if (min === null || next.phase.deadline === null || next.phase.paused) return next;
  if (readingNow(next)?.key !== key) return next;
  const floor = Math.max(next.stepAt + min, now + 50);
  const until = ms >= 0 ? Math.max(floor, now + ms + VOICE_BEAT_MS) : floor;
  return { ...next, phase: { ...next.phase, deadline: until } };
}
