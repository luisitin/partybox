// Odds words and payouts. Pure, no content imports (the client reads the tier words too).

export type Tier = 'LIKELY' | 'MAYBE' | 'RARE';

export function tierOf(chance: number): Tier {
  if (chance >= 50) return 'LIKELY';
  if (chance >= 20) return 'MAYBE';
  return 'RARE';
}

/** What a right call pays, × the stake: fair odds (100 / chance) rounded UP to the tenth, so a bet
 *  returns at least its stake on average (1.00–1.08) and betting beats sitting out (review: at the
 *  old 0.92 the best play was never to bet). The long shot still pays big, the favourite little.
 *  Decided by the game session per the owner's "decide and document" (NOTES.md). */
export function payOf(chance: number): number {
  const fair = 100 / Math.max(1, chance);
  return Math.max(1.1, Math.ceil(Math.round(fair * 1000) / 100) / 10);
}

/** The winnings for a right call: the stake back plus the profit, rounded down to whole coins. */
export function payout(amount: number, pay: number, grand: boolean): number {
  return Math.floor(amount * pay * (grand ? 2 : 1));
}
