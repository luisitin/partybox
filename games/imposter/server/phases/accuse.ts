// Phase "accuse": each accused player in turn — the spotlight (1.5 s, "The room accuses Sam."),
// then the role card flips (IMPOSTER or INNOCENT). Two beats per accused on one phase instance
// (ADR-033); the role enters the views only on the flip beat, so no phone can spoil it.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { ACCUSE_FLIP_MS, ACCUSE_SPOT_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterAccuse(state: State, now: number): State {
  const round = { ...state.round, spot: 0, flipped: false };
  return enterPhase({ ...state, round }, 'accuse', now, ACCUSE_SPOT_MS);
}

/** The next beat: flip the card, or spotlight the next accused; null when the phase is over. */
export function stepAccuse(state: State, now: number): State | null {
  const r = state.round;
  if (!r.flipped) {
    const round = { ...r, flipped: true };
    return { ...state, round, phase: { ...state.phase, deadline: now + ACCUSE_FLIP_MS } };
  }
  if (r.spot + 1 < r.accused.length) {
    const round = { ...r, spot: r.spot + 1, flipped: false };
    return { ...state, round, phase: { ...state.phase, deadline: now + ACCUSE_SPOT_MS } };
  }
  return null;
}

export function reduceAccuse(state: State, event: GameEvent<Input>, next: Transition): State {
  if (!isTimerFor(state, event)) return state;
  return stepAccuse(state, event.now) ?? next(state, event.now);
}
