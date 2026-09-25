// The hive's order and a round's points (README "Scoring"; SPEC §6.6). Pure functions over the
// round's orders; no state, no rng. Every order here is already a permutation of the five ids.
import type { Delta } from './types';

/** At least this many orders make a hive; fewer is "Not enough bees!". */
export const MIN_ORDERS = 2;

export interface Hive {
  /** Item ids, number one first. */
  order: string[];
  /** Item id → the sum of the spots it was given (1–5). */
  totals: Record<string, number>;
}

/**
 * Sum of spots, lowest first; ties go to more first-place votes, then more second-place votes and
 * so on, then the pack's item order. Null with fewer than `MIN_ORDERS` orders.
 */
export function buildHive(packOrder: readonly string[], orders: readonly string[][]): Hive | null {
  if (orders.length < MIN_ORDERS) return null;
  const totals: Record<string, number> = {};
  const votes: Record<string, number[]> = {};
  for (const id of packOrder) {
    totals[id] = 0;
    votes[id] = packOrder.map(() => 0);
  }
  for (const order of orders)
    order.forEach((id, spot) => {
      totals[id] = (totals[id] ?? 0) + spot + 1;
      const row = votes[id];
      if (row) row[spot] = (row[spot] ?? 0) + 1;
    });
  const index = new Map(packOrder.map((id, i) => [id, i]));
  const order = [...packOrder].sort((a, b) => {
    const byTotal = (totals[a] ?? 0) - (totals[b] ?? 0);
    if (byTotal !== 0) return byTotal;
    const va = votes[a] ?? [];
    const vb = votes[b] ?? [];
    for (let spot = 0; spot < packOrder.length; spot++) {
      const byVotes = (vb[spot] ?? 0) - (va[spot] ?? 0);
      if (byVotes !== 0) return byVotes;
    }
    return (index.get(a) ?? 0) - (index.get(b) ?? 0);
  });
  return { order, totals };
}

/** One player's round against the hive: +2 exact, +1 one spot off, +2 more for all five exact. */
export function scoreOrder(order: readonly string[], hive: readonly string[]): Delta {
  let exact = 0;
  let near = 0;
  order.forEach((id, spot) => {
    const at = hive.indexOf(id);
    if (at === spot) exact += 1;
    else if (Math.abs(at - spot) === 1) near += 1;
  });
  const perfect = exact === hive.length;
  return { pts: exact * 2 + near + (perfect ? 2 : 0), exact, near, perfect };
}

export function scoreRound(
  orders: Readonly<Record<string, string[]>>,
  hive: readonly string[],
): Record<string, Delta> {
  const out: Record<string, Delta> = {};
  for (const [id, order] of Object.entries(orders)) out[id] = scoreOrder(order, hive);
  return out;
}

/** The round's top scorers (ties share it); nobody when the best is 0. */
export function queensOf(delta: Readonly<Record<string, Delta>>): string[] {
  const rows = Object.entries(delta);
  const best = Math.max(0, ...rows.map(([, d]) => d.pts));
  if (best === 0) return [];
  return rows
    .filter(([, d]) => d.pts === best)
    .map(([id]) => id)
    .sort();
}

/** The round's lowest scorers — only when scores differ (a round where everyone ties has no odd
 *  one out). */
export function lowsOf(delta: Readonly<Record<string, Delta>>): string[] {
  const pts = Object.values(delta).map((d) => d.pts);
  if (pts.length < 2) return [];
  const low = Math.min(...pts);
  if (low === Math.max(...pts)) return [];
  return Object.entries(delta)
    .filter(([, d]) => d.pts === low)
    .map(([id]) => id)
    .sort();
}

/** The key of a pair of players: both ids, sorted, joined by "|". */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** For every pair of orders, how many things the two placed in the same spot. */
export function samePairs(orders: Readonly<Record<string, string[]>>): Record<string, number> {
  const ids = Object.keys(orders).sort();
  const out: Record<string, number> = {};
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) {
      const a = orders[ids[i] ?? ''] ?? [];
      const b = orders[ids[j] ?? ''] ?? [];
      const same = a.filter((id, spot) => b[spot] === id).length;
      if (same > 0) out[pairKey(ids[i] ?? '', ids[j] ?? '')] = same;
    }
  return out;
}

/** Is `items` exactly the round's five ids, each once? */
export function isPermutation(items: readonly string[], ids: readonly string[]): boolean {
  if (items.length !== ids.length) return false;
  const want = new Set(ids);
  const seen = new Set<string>();
  for (const id of items) {
    if (!want.has(id) || seen.has(id)) return false;
    seen.add(id);
  }
  return true;
}
