// Phase "swap" (doors only, LIVE-EVENTS.md): the host opens a goat door — one nobody bet on when it
// can — and every bettor ends on a door: their own (stay) or another closed one (switch). A bettor
// whose own door was opened must move. Ends when every connected bettor has chosen, at SWAP_MS, or
// on the VIP's skip; the chosen doors then become the bets that `open` settles.
import { allConnectedDone, enterPhase, isTimerFor, nextFloat } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { SWAP_MS } from '../timing';
import type { Input, State, Transition } from '../types';
import { inGame } from './bet';

/** Bettors (a stake on this box) who are still in the game. */
export function swappers(state: State): string[] {
  return Object.entries(state.r.bets)
    .filter(([id, b]) => b.amount > 0 && inGame(state, id))
    .map(([id]) => id);
}

export function isDoors(state: State): boolean {
  return state.boxes[state.r.idx]?.box.event === 'doors';
}

/** The goat door the host opens: never the car; the one with the fewest bets; ties by the rng. */
export function hostDoor(state: State): [number, State['rng']] {
  const car = state.boxes[state.r.idx]?.outcome ?? 0;
  const count = (d: number): number =>
    Object.values(state.r.bets).filter((b) => b.amount > 0 && b.option === d).length;
  const goats = [0, 1, 2].filter((d) => d !== car);
  const least = Math.min(...goats.map(count));
  const pool = goats.filter((d) => count(d) === least);
  const [f, rng] = nextFloat(state.rng);
  return [pool[Math.min(pool.length - 1, Math.floor(f * pool.length))] ?? goats[0] ?? 0, rng];
}

export function enterSwap(state: State, now: number): State {
  const [opened, rng] = hostDoor(state);
  return enterPhase({ ...state, rng, r: { ...state.r, opened, swaps: {} } }, 'swap', now, SWAP_MS);
}

/** Everyone who has to choose has chosen (a bettor on the opened door included). */
export function swapsIn(state: State): boolean {
  const done = Object.keys(state.r.swaps ?? {});
  const idle = state.seats.filter((id) => !swappers(state).includes(id));
  return allConnectedDone(state, [...done, ...idle]);
}

/** The door each bettor ends on: their choice, else their own (a forced move takes the lower
 *  closed door) — written back into the bets so `open` settles them as usual. */
export function closeSwap(state: State): State {
  const opened = state.r.opened ?? -1;
  const bets = { ...state.r.bets };
  for (const [id, bet] of Object.entries(bets)) {
    if (bet.amount <= 0) continue;
    const chosen = state.r.swaps?.[id];
    const door =
      chosen ?? (bet.option === opened ? ([0, 1, 2].find((d) => d !== opened) ?? 0) : bet.option);
    bets[id] = { ...bet, option: door };
  }
  return { ...state, r: { ...state.r, bets } };
}

export function reduceSwap(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'swap') return state;
  const id = event.playerId;
  const door = event.input.door;
  if (!swappers(state).includes(id) || door === state.r.opened) return state;
  const after: State = { ...state, r: { ...state.r, swaps: { ...state.r.swaps, [id]: door } } };
  return swapsIn(after) ? next(after, event.now) : after;
}
