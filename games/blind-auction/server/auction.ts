// Bidding rules (SPEC §8.6): who wins a sealed lot, and whether a live raise stands. Pure.
import { nextInt } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { LIVE_OPENING_BID } from './timing';
import type { Notice, State } from './types';

/** The raise steps a phone offers in Live mode, besides All in. */
export const RAISE_STEPS = [5, 10, 25] as const;

/** A seated player who has not left the game (they may still be reconnecting). */
export function inGame(state: State, id: string): boolean {
  return Object.hasOwn(state.players, id) && !state.left.includes(id);
}

export interface Sale {
  winner: string | null;
  price: number;
  tie: boolean;
}

/** Sealed: highest bid wins; a tie goes to fewer coins, then the rng. Bids of 0 are passes. */
export function resolveSealed(state: State, rng: RngState): [Sale, RngState] {
  const bids = Object.entries(state.l.bids).filter(([, amount]) => amount > 0);
  if (bids.length === 0) return [{ winner: null, price: 0, tie: false }, rng];
  const top = Math.max(...bids.map(([, amount]) => amount));
  const tied = bids.filter(([, amount]) => amount === top).map(([id]) => id);
  if (tied.length === 1) return [{ winner: tied[0] ?? null, price: top, tie: false }, rng];
  const fewest = Math.min(...tied.map((id) => state.coins[id] ?? 0));
  const poorest = tied.filter((id) => (state.coins[id] ?? 0) === fewest).sort(byId);
  if (poorest.length === 1) return [{ winner: poorest[0] ?? null, price: top, tie: true }, rng];
  const [i, next] = nextInt(rng, 0, poorest.length - 1);
  return [{ winner: poorest[i] ?? null, price: top, tie: true }, next];
}

/** Code-point order: no locale APIs in game servers (audit #30). */
export function byId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Why a sealed bid is refused, or null when it stands. */
export function refuseBid(state: State, id: string, amount: number): Notice['code'] | null {
  return amount > (state.coins[id] ?? 0) ? 'over' : null;
}

/** Live: a raise carries the absolute amount; it stands only if higher, affordable and not your own. */
export function refuseRaise(state: State, id: string, amount: number): Notice['code'] | null {
  const high = state.l.high;
  if (high?.by === id) return 'winning';
  const floor = high ? high.amount + 1 : LIVE_OPENING_BID;
  if (amount < floor || amount > (state.coins[id] ?? 0)) return 'outbid';
  return null;
}

/** The amounts a phone's raise buttons would bid right now: +5, +10, +25, then All in. */
export function raiseOptions(state: State, id: string): { step: number; amount: number }[] {
  const base = state.l.high?.amount ?? 0;
  const own = state.coins[id] ?? 0;
  const steps = RAISE_STEPS.map((step) => ({ step, amount: base + step }));
  return [...steps, { step: 0, amount: Math.max(own, base + 1) }];
}
