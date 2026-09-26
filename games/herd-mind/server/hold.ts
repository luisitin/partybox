// The settings hold (the owner, 2026-09-24, like Bingo's style menu): while any player has their
// settings menu open the game waits for everyone — the phase's clock stops with what it had left
// (`hold.remaining`), no timer can fire, and the stage freezes. When the last menu closes, a
// 3 · 2 · 1 on every screen (`resumeAt`), and the phase goes on with the time it had, plus the
// count. A VIP skip or end clears the hold (the VIP moves the room on); a player who drops or
// leaves with a menu open no longer holds it.
import { hasPlayer } from '@partybox/game-sdk';
import { COUNTDOWN_MS } from './types';
import type { State } from './types';

function startHold(state: State, now: number): State {
  const deadline = state.phase.deadline;
  return {
    ...state,
    hold: { remaining: deadline === null ? null : Math.max(0, deadline - now) },
    resumeAt: null,
    phase: { ...state.phase, deadline: null },
  };
}

function endHold(state: State, now: number): State {
  const remaining = state.hold?.remaining ?? null;
  const resumeAt = now + COUNTDOWN_MS;
  const deadline = remaining === null ? null : resumeAt + remaining;
  return {
    ...state,
    hold: null,
    resumeAt,
    phase: { ...state.phase, deadline },
  };
}

/** Sets `menus` and starts or ends the hold as the first menu opens / the last one closes. */
function withMenus(state: State, menus: string[], now: number): State {
  const was = state.menus.length > 0;
  const next: State = { ...state, menus };
  if (!was && menus.length > 0) return startHold(next, now);
  if (was && menus.length === 0) return endHold(next, now);
  return next;
}

export function applyMenu(state: State, playerId: string, open: boolean, now: number): State {
  if (state.phase.id === 'done' || !hasPlayer(state, playerId) || state.left.includes(playerId))
    return state;
  if (state.phase.paused) return state;
  const has = state.menus.includes(playerId);
  if (open === has) return state;
  return withMenus(
    state,
    open ? [...state.menus, playerId] : state.menus.filter((id) => id !== playerId),
    now,
  );
}

/** A player dropped or left: their open menu stops holding the room. */
export function releaseMenu(state: State, playerId: string, now: number): State {
  if (!state.menus.includes(playerId)) return state;
  return withMenus(
    state,
    state.menus.filter((id) => id !== playerId),
    now,
  );
}

/** The VIP moved the room on: nobody's menu holds the next phase. */
export function clearHold(state: State): State {
  if (!state.hold && state.menus.length === 0 && state.resumeAt === null) return state;
  return { ...state, hold: null, menus: [], resumeAt: null };
}
