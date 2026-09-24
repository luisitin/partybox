// A lot's hint (SPEC §8.3): every possible outcome with its tier word. Hints are always true and
// always complete; nothing in them depends on which outcome the lot holds. Pure; no content imports
// (the client reuses the types).
import type { Outcome, OutcomeType } from '../content/schema';

export type Tier = 'LIKELY' | 'MAYBE' | 'RARE';

export interface Hint {
  tier: Tier;
  type: OutcomeType;
  /** Coins for gain / lose; percent for steal; 0 otherwise. */
  n: number;
}

export function tierOf(chance: number): Tier {
  if (chance >= 50) return 'LIKELY';
  if (chance >= 20) return 'MAYBE';
  return 'RARE';
}

/** Most likely first; equal chances keep the pack's order. */
export function hintsOf(outcomes: readonly Outcome[]): Hint[] {
  return outcomes
    .map((o, i) => ({ o, i }))
    .sort((a, b) => b.o.chance - a.o.chance || a.i - b.i)
    .map(({ o }) => ({
      tier: tierOf(o.chance),
      type: o.type,
      n: o.type === 'gain' || o.type === 'lose' ? o.amount : o.type === 'steal' ? o.percent : 0,
    }));
}

/** The chance a bot reads into a tier word (SPEC §8.11). */
export const TIER_CHANCE: Record<Tier, number> = { LIKELY: 60, MAYBE: 30, RARE: 10 };
