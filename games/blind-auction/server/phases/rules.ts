// Phase "rules" (the owner, 2026-09-24: "start the game explaining the rules and waiting for
// everybody to ready up"): the TV and every phone walk through the three steps; each person taps
// Ready (bots are ready from the start). Once everyone connected is ready — or after 40 s, or on the
// VIP's skip — a 3·2·1 (step 1, ADR-033) and the first box.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { COUNTDOWN_MS, RULES_SAFETY_MS } from '../timing';
import type { Input, State, Transition } from '../types';

export function enterRules(state: State, now: number): State {
  // The owner's rule [cc45f4]: the game does not start until every connected player is ready; the
  // VIP's "Start now" is the escape. A hidden safety net (never shown as a clock) only keeps a
  // phone left on the table from holding the room forever (the contract: idle players end).
  return enterPhase({ ...state, rulesStep: 0 }, 'rules', now, RULES_SAFETY_MS);
}

/** Everyone still connected (and in the game) has tapped Ready. */
export function allReady(state: State): boolean {
  const here = state.seats.filter(
    (id) => state.players[id]?.connected === true && !state.left.includes(id),
  );
  return here.length > 0 && here.every((id) => state.ready.includes(id));
}

/** Step 1: the countdown before the first box. */
export function countDown(state: State, now: number): State {
  if (state.rulesStep === 1) return state;
  return { ...state, rulesStep: 1, phase: { ...state.phase, deadline: now + COUNTDOWN_MS } };
}

/** Someone real has tapped Ready (bots are ready from the start). */
function anyHumanReady(state: State): boolean {
  return state.ready.some((id) => state.players[id]?.bot !== true);
}

export function reduceRules(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) {
    if (state.rulesStep === 1) return next(state, event.now);
    // The safety net only ends a room where no person has done anything (the contract's idle
    // players); once anyone is ready, it keeps waiting for the rest (reviewer [a9623e]).
    if (anyHumanReady(state))
      return { ...state, phase: { ...state.phase, deadline: event.now + RULES_SAFETY_MS } };
    return countDown(state, event.now);
  }
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  const id = event.playerId;
  if (!Object.hasOwn(state.players, id) || state.ready.includes(id) || state.rulesStep === 1)
    return state;
  const after: State = { ...state, ready: [...state.ready, id] };
  return allReady(after) ? countDown(after, event.now) : after;
}
