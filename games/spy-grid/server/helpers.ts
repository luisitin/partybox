// STAND-INS for the Foundation's shared helpers (Part 00 §6: `teamsFromSeed`, `majorityPick`,
// `rotation`), which have not landed on main yet. Shaped as the audit asks (#53): pure, never throw,
// `[value, RngState]` returns. Swap for the SDK's when it ships (NOTES.md).
import { shuffle } from '@partybox/game-sdk';
import type { PlayerInfo, RngState } from '@partybox/game-sdk';

/** Two even teams (sizes differ by at most one), people and bots each spread across both. */
export function teamsFromSeed(
  players: readonly PlayerInfo[],
  rng: RngState,
): [[string[], string[]], RngState] {
  const [people, r1] = shuffle(
    rng,
    players.filter((p) => p.bot !== true).map((p) => p.id),
  );
  const [bots, r2] = shuffle(
    r1,
    players.filter((p) => p.bot === true).map((p) => p.id),
  );
  const a: string[] = [];
  const b: string[] = [];
  for (const id of [...people, ...bots]) (a.length <= b.length ? a : b).push(id);
  return [[a, b], r2];
}

/** The most-voted value; a tie is broken by the rng; no votes → null. */
export function majorityPick<T extends string | number>(
  votes: readonly T[],
  rng: RngState,
): [T | null, RngState] {
  const counts = new Map<T, number>();
  for (const v of votes) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = 0;
  for (const c of counts.values()) best = Math.max(best, c);
  const top = [...counts].filter(([, c]) => c === best).map(([v]) => v);
  if (top.length === 0) return [null, rng];
  if (top.length === 1) return [top[0] ?? null, rng];
  const [shuffled, next] = shuffle(rng, top);
  return [shuffled[0] ?? null, next];
}

/** The member whose turn it is in round `round` (0-based), cycling through `order`. */
export function rotation<T>(order: readonly T[], round: number): T | null {
  if (order.length === 0) return null;
  const i = ((round % order.length) + order.length) % order.length;
  return order[i] ?? null;
}
