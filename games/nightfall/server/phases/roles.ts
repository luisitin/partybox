// Phase "roles": the shell's start stage has already shown the rules, taken everyone's READY and
// counted 3 · 2 · 1 (#decisions cc45f4). Here every phone holds its secret card and taps Got it;
// the night falls when every connected player has (bots at once; a dropped phone doesn't block).
// No visible clock. A hidden net (READY_FALLBACK_MS) starts the night only in a room where no
// human tapped at all (the idle-room contract); while anyone is still reading it re-arms, up to
// READY_REARMS × the net in all.
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { READY_FALLBACK_MS, READY_REARMS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterRoles(state: State, now: number): State {
  const bots = state.seats.filter((id) => state.players[id]?.bot === true);
  return enterPhase(
    { ...state, ready: bots, step: 0, stepAt: now },
    'roles',
    now,
    READY_FALLBACK_MS,
  );
}

/** Every connected player has read their card. */
export function rolesDone(state: State): boolean {
  return allConnectedDone(state, state.ready);
}

function humanTapped(state: State): boolean {
  return state.ready.some((id) => state.players[id]?.bot !== true);
}

export function reduceRoles(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) {
    // An empty room starts at once; one where someone is still reading waits, but not forever: a
    // player who walked off with a connected phone must not hold the room (the VIP can skip too).
    const waited = event.now - state.phase.startedAt;
    if (!humanTapped(state) || waited >= READY_FALLBACK_MS * READY_REARMS)
      return next(state, event.now);
    return { ...state, phase: { ...state.phase, deadline: event.now + READY_FALLBACK_MS } };
  }
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  if (!hasPlayer(state, event.playerId) || state.ready.includes(event.playerId)) return state;
  const after: State = { ...state, ready: [...state.ready, event.playerId] };
  return rolesDone(after) ? next(after, event.now) : after;
}
