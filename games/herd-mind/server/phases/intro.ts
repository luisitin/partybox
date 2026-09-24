// Phase "intro" (once): the rules on every screen, and a ready-up (the owner, 2026-09-24: "give
// the players time to read the rules; once everyone's ready, 3 · 2 · 1"). Each player taps Ready
// (bots are ready from the start); when every connected player is, a breath and then the
// 3 · 2 · 1 (`startAt`), and question 1. The VIP's Start now (a skip) starts the 3 · 2 · 1 at once;
// nobody tapping still starts it after INTRO_MS.
import { connectedIds, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { COUNTDOWN_MS, INTRO_MS, READY_BREATH_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterIntro(state: State, now: number): State {
  const bots = state.seats.filter((id) => state.players[id]?.bot === true);
  return enterPhase({ ...state, ready: bots, startAt: null }, 'intro', now, INTRO_MS);
}

/** The 3 · 2 · 1 before question 1 (the intro's deadline becomes its end). */
export function startCountdown(state: State, now: number): State {
  if (state.startAt !== null) return state;
  const startAt = now + READY_BREATH_MS + COUNTDOWN_MS;
  return { ...state, startAt, phase: { ...state.phase, deadline: startAt } };
}

/** Everyone connected has tapped Ready (and at least one person is here). */
export function allReady(state: State): boolean {
  const here = connectedIds(state).filter((id) => !state.left.includes(id));
  return here.length > 0 && here.every((id) => state.ready.includes(id));
}

/** A Ready, a drop or a leave may complete the room: start the count (not during a hold). */
export function checkReady(state: State, now: number): State {
  if (state.phase.id !== 'intro' || state.hold || state.startAt !== null || !allReady(state))
    return state;
  return startCountdown(state, now);
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  const id = event.playerId;
  if (!hasPlayer(state, id) || state.left.includes(id) || state.ready.includes(id)) return state;
  return checkReady({ ...state, ready: [...state.ready, id] }, event.now);
}
