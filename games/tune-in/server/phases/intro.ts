// Phase "intro" (once): the rules on every screen and a ready-up (the owner's pacing rule
// [cc45f4]: "the game does NOT start until every connected player has tapped ready … then a clear
// 3 · 2 · 1"). Each player taps I'm ready (bots are ready from the start); when every connected
// player is, a breath and then the 3 · 2 · 1 (`startAt`), and turn 1. The VIP's Start now (a skip)
// starts the 3 · 2 · 1 at once. The INTRO_MS net starts only a room where nobody has tapped; once
// anyone has, it waits for the rest ([a9623e]), up to INTRO_GIVE_UP_MS. The same shape as Herd
// Mind's intro, until the shell's ready-up stage lands.
import { connectedIds, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { COUNTDOWN_MS, INTRO_GIVE_UP_MS, INTRO_MS, READY_BREATH_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterIntro(state: State, now: number): State {
  const bots = state.seats.filter((id) => state.players[id]?.bot === true);
  return enterPhase({ ...state, ready: bots, startAt: null }, 'intro', now, INTRO_MS);
}

/** The 3 · 2 · 1 before turn 1 (the intro's deadline becomes its end). */
export function startCountdown(state: State, now: number): State {
  if (state.startAt !== null) return state;
  const startAt = now + READY_BREATH_MS + COUNTDOWN_MS;
  return { ...state, startAt, phase: { ...state.phase, deadline: startAt } };
}

/** Everyone connected has tapped I'm ready (and at least one person is here). */
export function allReady(state: State): boolean {
  const here = connectedIds(state).filter((id) => !state.left.includes(id));
  return here.length > 0 && here.every((id) => state.ready.includes(id));
}

/** A Ready, a drop or a leave may complete the room: start the count. */
export function checkReady(state: State, now: number): State {
  if (state.phase.id !== 'intro' || state.startAt !== null || !allReady(state)) return state;
  return startCountdown(state, now);
}

/** The net fired before the 3 · 2 · 1: once any person has tapped, the room waits for the rest
 *  (re-armed, so the net fires again), until INTRO_GIVE_UP_MS after the rules came up. Null: go. */
export function netWaits(state: State, now: number): State | null {
  if (state.startAt !== null) return null;
  const someone = state.ready.some((id) => state.players[id]?.bot !== true);
  const giveUpAt = state.phase.startedAt + INTRO_GIVE_UP_MS;
  if (!someone || now >= giveUpAt) return null;
  return { ...state, phase: { ...state.phase, deadline: Math.min(now + INTRO_MS, giveUpAt) } };
}

export function reduceIntro(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return netWaits(state, event.now) ?? next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  const id = event.playerId;
  if (!hasPlayer(state, id) || state.left.includes(id) || state.ready.includes(id)) return state;
  return checkReady({ ...state, ready: [...state.ready, id] }, event.now);
}
