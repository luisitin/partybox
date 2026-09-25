// Phase "reveal", paced in two beats (ADR-033: the phase re-arms its own deadline). Step 0: the
// shutter swings open, the faces land, the needle settles. Step 1: the points pop, the reader says
// the verdict, and only now do phones show their own result. A void round is one "No signal!" beat.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { scoreTurn } from '../scoring';
import { verdictReading } from '../speech';
import { REVEAL_OPEN_MS, REVEAL_POINTS_MS, VOICE_BEAT_MS, VOID_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterReveal(state: State, now: number): State {
  const scored = scoreTurn({ ...state, played: state.played + 1 });
  const ms = scored.turn.void ? VOID_MS : REVEAL_OPEN_MS;
  return enterPhase({ ...scored, turn: { ...scored.turn, step: 0 } }, 'reveal', now, ms);
}

/** Step 1 lasts the points beat, or the verdict's reading and a breath if that is longer. */
function pointsMs(state: State): number {
  const reading = verdictReading(state);
  const ms = reading ? state.speechMs[reading.key] : undefined;
  return ms !== undefined && ms > 0
    ? Math.max(REVEAL_POINTS_MS, ms + VOICE_BEAT_MS)
    : REVEAL_POINTS_MS;
}

/** Step 0 → 1 (same phase instance, a later deadline); step 1 or a void beat → onwards. */
export function stepReveal(state: State, now: number, next: Transition): State {
  if (state.turn.void || state.turn.step === 1) return next(state, now);
  return {
    ...state,
    turn: { ...state.turn, step: 1 },
    phase: { ...state.phase, deadline: now + pointsMs(state) },
  };
}

export function reduceReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? stepReveal(state, event.now, next) : state;
}
