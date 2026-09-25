// Phase "intro" (once): the rules on every screen and a ready-up (owner, [cc45f4]: "never rush the
// players"). Each player taps I'm ready (bots are ready from the start; a dropped phone never
// blocks); once every connected player is, a breath and then the 3 · 2 · 1 (`counting`, ending on the deadline), and
// question 1. The VIP's Start now (a skip) starts the 3 · 2 · 1 at once; INTRO_MS frees only a room
// where no human has tapped Ready; once someone has, the rules wait for everyone.
import { connectedIds, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { COUNTDOWN_MS, INTRO_MS, READY_BREATH_MS, READY_WAIT_MAX_MS } from '../types';
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

/** A connected human has tapped Ready: somebody is actually here, waiting on the rest. */
function someoneWaiting(state: State): boolean {
  return connectedIds(state).some(
    (id) => state.players[id]?.bot !== true && state.ready.includes(id),
  );
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) {
    const waited = event.now - state.phase.startedAt;
    if (state.counting || !someoneWaiting(state) || waited >= READY_WAIT_MAX_MS)
      return next(state, event.now);
    // A person tapped Ready and another is still reading: keep waiting (reviewer, the idle-net
    // note). Only a phone left untouched for READY_WAIT_MAX_MS is given up on — the sim's idle
    // seats; a real room has pressed Start now long before (the shell stage will drop this).
    const deadline = Math.min(event.now + INTRO_MS, state.phase.startedAt + READY_WAIT_MAX_MS);
    return { ...state, phase: { ...state.phase, deadline } };
  }
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  const id = event.playerId;
  if (!hasPlayer(state, id) || state.left.includes(id) || state.ready.includes(id)) return state;
  return checkReady({ ...state, ready: [...state.ready, id] }, event.now);
}
