// Round bookkeeping shared by the phases (phase files never import each other): a fresh round,
// the question on stage, and the speech events every phase records.
import type { Question } from '../content/schema';
import { msOf, sayRequest } from './speech';
import { SAY_LATE_MS } from './types';
import type { Round, State } from './types';

export function newRound(n: number): Round {
  return {
    n,
    orders: {},
    hive: null,
    totals: {},
    step: 0,
    voiced: [],
    hold: false,
    delta: {},
    queens: [],
    lows: [],
    short: false,
    sayOk: false,
    applied: false,
  };
}

/** The question of the round on stage. */
export function question(state: State): Question | null {
  return state.questions[state.q.n - 1] ?? null;
}

/** The question's reading plays only if it is ready while `rank` is fresh. */
export function sayReady(state: State): boolean {
  const ms = msOf(state, sayRequest(state, state.q.n));
  return ms !== undefined && ms >= 0;
}

/** ADR-045: a reading is ready (or failed): keep its length; a question reading that arrives
 *  early in `rank` still gets to play. */
export function recordSpeech(state: State, key: string, ms: number, now: number): State {
  const next: State = { ...state, speechMs: { ...state.speechMs, [key]: ms } };
  const fresh =
    state.phase.id === 'rank' && now - state.phase.startedAt <= SAY_LATE_MS && !state.q.sayOk;
  return fresh && sayReady(next) ? { ...next, q: { ...next.q, sayOk: true } } : next;
}
