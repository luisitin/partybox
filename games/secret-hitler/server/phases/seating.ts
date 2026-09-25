// Phase "seating": the shell's start stage (ADR-053) has shown the rules, taken everyone's READY and
// counted 3 · 2 · 1. What's left is game content: each player reads their secret dossier (R2) and
// taps "I've read it". Round 1 begins once every connected seat has read theirs (bots read at once;
// a dropped phone doesn't block); no second count-in. The VIP's skip starts round 1 at once. A
// hidden net (the group standard, hub e67ec9) ends an idle table: at SEATING_SAFETY_MS with nobody
// tapped it starts; if someone has tapped it re-arms, up to SEATING_PATIENCE_MS in all, so a slow
// reader is never started on and a forgotten phone can't hang the room.
import { hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go } from '../phase';
import { SEATING_PATIENCE_MS, SEATING_SAFETY_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterSeating(state: State, now: number): State {
  return go(state, 'seating', now, SEATING_SAFETY_MS);
}

/** Every connected seat has read its dossier (and at least one seat is here). */
export function allRead(state: State): boolean {
  const here = state.alive.filter((id) => state.players[id]?.connected);
  return here.length > 0 && here.every((id) => state.ready.includes(id));
}

/** A read, a drop or a leave may complete the table: round 1. Paused: resume re-checks. */
export function checkRead(state: State, now: number, next: Transition): State {
  if (state.phase.id !== 'seating' || state.phase.paused) return state;
  return allRead(state) ? next(state, now) : state;
}

export function reduceSeating(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) {
    const someoneTapped = state.ready.some((id) => state.players[id]?.bot !== true);
    const waited = event.now - state.phase.startedAt;
    if (!someoneTapped || waited >= SEATING_PATIENCE_MS) return next(state, event.now);
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
  return checkRead({ ...state, ready: [...state.ready, id] }, event.now, next);
}
