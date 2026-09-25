// Phase "roles" (the owner's pacing rule, #decisions cc45f4): the rules on the TV, every phone
// holds its SecretCard, and each player taps Ready. No visible clock: the night waits until every
// connected player is ready (bots are ready from the start; a dropped phone doesn't block; a room
// nobody taps in at all starts the count after READY_FALLBACK_MS, the idle-room contract). Then
// step 1: a breath and a 3 · 2 · 1 (the phase deadline is its end), then the night. The VIP's skip
// is "Start now": it starts the 3 · 2 · 1 at once.
import { allConnectedDone, enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { COUNTDOWN_MS, READY_BREATH_MS, READY_FALLBACK_MS } from '../types';
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

/** Step 1: the 3 · 2 · 1 before the first night. */
export function startCount(state: State, now: number): State {
  if (state.step !== 0) return state;
  return {
    ...state,
    step: 1,
    stepAt: now,
    phase: { ...state.phase, deadline: now + READY_BREATH_MS + COUNTDOWN_MS },
  };
}

/** A Ready or a drop may complete the room. */
export function checkReady(state: State, now: number): State {
  if (state.phase.id !== 'roles' || state.step !== 0 || state.phase.paused) return state;
  return allConnectedDone(state, state.ready) ? startCount(state, now) : state;
}

export function reduceRoles(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  if (!hasPlayer(state, event.playerId) || state.ready.includes(event.playerId)) return state;
  return checkReady({ ...state, ready: [...state.ready, event.playerId] }, event.now);
}
