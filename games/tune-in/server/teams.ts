// Tune In's own team rules. The teams themselves come from the SDK's teamsFromSeed (F7); the call
// keeps its own majority because spec §5.7 wants a tied call to score nothing, where the SDK's
// majorityPick breaks a tie by the rng.
import { nextInt } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import type { Side } from './types';

/** The side most callers tapped, or null for a tie or no taps (spec §5.7: neither scores). */
export function majoritySide(calls: Record<string, Side>, callers: readonly string[]): Side | null {
  let left = 0;
  let right = 0;
  for (const id of callers) {
    const side = calls[id];
    if (side === 'left') left += 1;
    else if (side === 'right') right += 1;
  }
  if (left === right) return null;
  return left > right ? 'left' : 'right';
}

/** A seeded coin, for the rare pick with no better rule (which team starts). */
export function coin(rng: RngState): [boolean, RngState] {
  const [n, next] = nextInt(rng, 0, 1);
  return [n === 1, next];
}
