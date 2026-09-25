// Phase "seating": everyone reads their dossier (R2) and the rules on the TV, and taps Got it. The
// owner's pacing rule (2026-09-24) replaces D1's 30 s here: nothing starts until every connected
// seat is ready (bots are ready from the start; a dropped phone doesn't block), then a breath and
// 3 · 2 · 1 (`startAt`, the phase's deadline), then round 1. The VIP's Start now (a skip) starts
// the count at once. The hidden SEATING_SAFETY_MS net exists for idle tables (the contract suite's,
// where nobody taps): when it fires and a person has tapped, it re-arms and keeps waiting, so a
// slow reader is never started on (hub review, 2026-09-25), up to SEATING_PATIENCE_MS in all (the
// sim's mixed tables keep an idle phone connected and must still end).
import { hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go } from '../phase';
import { COUNTDOWN_MS, SEATING_PATIENCE_MS, SEATING_SAFETY_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterSeating(state: State, now: number): State {
  return go({ ...state, startAt: null }, 'seating', now, SEATING_SAFETY_MS);
}

export function allReady(state: State): boolean {
  const here = state.alive.filter((id) => state.players[id]?.connected);
  return here.length > 0 && here.every((id) => state.ready.includes(id));
}

/** The 3 · 2 · 1 before round 1: the seating's deadline becomes its end. */
export function startCountdown(state: State, now: number): State {
  if (state.phase.id !== 'seating' || state.startAt !== null) return state;
  const startAt = now + COUNTDOWN_MS;
  return { ...state, startAt, phase: { ...state.phase, deadline: startAt } };
}

/** A ready, a drop or a leave may complete the table: start the count. */
export function checkReady(state: State, now: number): State {
  if (state.phase.id !== 'seating' || state.phase.paused) return state; // resume re-checks
  return allReady(state) ? startCountdown(state, now) : state;
}

export function reduceSeating(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) {
    if (state.startAt !== null) return next(state, event.now);
    const someoneTapped = state.ready.some((id) => state.players[id]?.bot !== true);
    const waited = event.now - state.phase.startedAt;
    if (!someoneTapped || waited >= SEATING_PATIENCE_MS) return startCountdown(state, event.now);
    // The last check lands exactly at the cap (review 4fa011 C1).
    const deadline = Math.min(
      event.now + SEATING_SAFETY_MS,
      state.phase.startedAt + SEATING_PATIENCE_MS,
    );
    return { ...state, phase: { ...state.phase, deadline } };
  }
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  const id = event.playerId;
  if (!hasPlayer(state, id) || !state.alive.includes(id) || state.ready.includes(id)) return state;
  return checkReady({ ...state, ready: [...state.ready, id] }, event.now);
}
