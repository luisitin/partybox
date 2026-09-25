// Phase "rules" (the owner, 2026-09-24: "start the game explaining the rules and waiting for
// everybody to ready up"): the TV and every phone walk through the three steps; each person taps
// Ready (bots are ready from the start). Once everyone connected is ready — or after 40 s, or on the
// VIP's skip — a 3·2·1 (step 1, ADR-033) and the first box.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { COUNTDOWN_MS, RULES_MS } from '../timing';
import type { Input, State, Transition } from '../types';

export function enterRules(state: State, now: number): State {
  return enterPhase({ ...state, rulesStep: 0 }, 'rules', now, RULES_MS);
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

export function reduceRules(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event))
    return state.rulesStep === 0 ? countDown(state, event.now) : next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'ready') return state;
  const id = event.playerId;
  if (!Object.hasOwn(state.players, id) || state.ready.includes(id) || state.rulesStep === 1)
    return state;
  const after: State = { ...state, ready: [...state.ready, id] };
  return allReady(after) ? countDown(after, event.now) : after;
}
