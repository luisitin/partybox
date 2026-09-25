// Phase "intro" (once): the rules on every screen and a ready-up (owner, [cc45f4]: "never rush the
// players"). Each player taps I'm ready (bots are ready from the start; a dropped phone never
// blocks); once every connected player is, a breath and then the 3 · 2 · 1 (`counting`, ending on the deadline), and
// question 1. The VIP's Start now (a skip) starts the 3 · 2 · 1 at once; INTRO_MS only stops a
// room of idle phones from hanging.
import { connectedIds, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { COUNTDOWN_MS, INTRO_MS, READY_BREATH_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterIntro(state: State, now: number): State {
  const bots = state.seats.filter((id) => state.players[id]?.bot === true);
  return enterPhase({ ...state, ready: bots, counting: false }, 'intro', now, INTRO_MS);
}

/** The 3 · 2 · 1 before question 1: the intro's deadline becomes its end. */
export function startCountdown(state: State, now: number): State {
  if (state.counting) return state;
  const deadline = now + READY_BREATH_MS + COUNTDOWN_MS;
  return { ...state, counting: true, phase: { ...state.phase, deadline } };
}

/** Everyone connected (and not gone) has tapped I'm ready, and someone is here. */
export function allReady(state: State): boolean {
  const here = connectedIds(state).filter((id) => !state.left.includes(id));
  return here.length > 0 && here.every((id) => state.ready.includes(id));
}

/** A Ready, a drop or a leave may complete the room: start the count (never while paused). */
export function checkReady(state: State, now: number): State {
  if (state.phase.id !== 'intro' || state.phase.paused || state.counting) return state;
  return allReady(state) ? startCountdown(state, now) : state;
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  const id = event.playerId;
  if (!hasPlayer(state, id) || state.left.includes(id) || state.ready.includes(id)) return state;
  return checkReady({ ...state, ready: [...state.ready, id] }, event.now);
}
