// Phase "potato" (hot potato, LIVE-EVENTS.md — the owner: "press the potato on your phone to pass
// it… a random tick after at least 3 seconds and before 30"): the potato starts with a random
// player; its holder taps to pass it to the next player round the circle. It pops at a SECRET time
// (POTATO_MIN_MS…POTATO_MAX_MS) that never reaches a view: the deadline only ever runs one
// POTATO_TICK_MS ahead (ADR-033 re-armed). At the pop the holder is the outcome, and gets burnt.
// The VIP's skip pops it at once.
import { enterPhase, isTimerFor, nextFloat } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import {
  POTATO_BOT_HOLD_MS,
  POTATO_BURN,
  POTATO_GRACE_MS,
  POTATO_HOLD_MS,
  POTATO_MAX_MS,
  POTATO_MIN_MS,
  POTATO_TICK_MS,
} from '../timing';
import type { Input, State, Transition } from '../types';
import { inGame } from './bet';

export function isPotato(state: State): boolean {
  return state.boxes[state.r.idx]?.box.event === 'potato';
}

/** Who can hold the potato: in the game and connected, in seat order. */
function circle(state: State): string[] {
  return state.seats.filter((id) => inGame(state, id) && state.players[id]?.connected === true);
}

/** The next holder round the circle after `id`. */
export function nextHolder(state: State, id: string): string {
  const ring = circle(state);
  if (ring.length === 0) return id;
  const at = ring.indexOf(id);
  return ring[(at + 1) % ring.length] ?? id;
}

export function enterPotato(state: State, now: number): State {
  const ring = circle(state);
  const [f1, s1] = nextFloat(state.rng);
  const [f2, s2] = nextFloat(s1);
  const holder = ring[Math.min(ring.length - 1, Math.floor(f1 * ring.length))] ?? state.seats[0];
  const popAt = now + POTATO_MIN_MS + Math.round(f2 * (POTATO_MAX_MS - POTATO_MIN_MS));
  return enterPhase(
    { ...state, rng: s2, r: { ...state.r, holder, heldAt: now, passes: 0, popAt } },
    'potato',
    now,
    POTATO_TICK_MS,
  );
}

/** The pop: the holder's option is the outcome, and the holder loses POTATO_BURN coins. */
export function pop(state: State): State {
  const holder = state.r.holder ?? '';
  const outcome = Math.max(0, state.seats.indexOf(holder));
  const boxes = state.boxes.map((b, i) => (i === state.r.idx ? { ...b, outcome } : b));
  const coins = { ...state.coins };
  if (Object.hasOwn(coins, holder)) coins[holder] = Math.max(0, (coins[holder] ?? 0) - POTATO_BURN);
  return { ...state, boxes, coins };
}

export function reducePotato(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) {
    if (event.now >= (state.r.popAt ?? 0)) return next(state, event.now);
    // Re-arm one tick ahead (never the pop itself: that stays secret).
    return { ...state, phase: { ...state.phase, deadline: event.now + POTATO_TICK_MS } };
  }
  if (event.type !== 'input' || event.input.type !== 'pass') return state;
  const { holder, heldAt = 0 } = state.r;
  const hold = state.players[event.playerId]?.bot === true ? POTATO_BOT_HOLD_MS : POTATO_HOLD_MS;
  if (event.playerId !== holder || event.now - heldAt < hold) return state;
  return {
    ...state,
    r: {
      ...state.r,
      holder: nextHolder(state, holder),
      heldAt: event.now,
      passes: (state.r.passes ?? 0) + 1,
      // The new holder gets a beat to react: the pop clock stands still for it.
      popAt: (state.r.popAt ?? event.now) + POTATO_GRACE_MS,
    },
  };
}

/** A holder who drops out passes it on at once. */
export function potatoDropped(state: State): State {
  const holder = state.r.holder;
  if (state.phase.id !== 'potato' || !holder) return state;
  if (inGame(state, holder) && state.players[holder]?.connected === true) return state;
  return { ...state, r: { ...state.r, holder: nextHolder({ ...state }, holder) } };
}
