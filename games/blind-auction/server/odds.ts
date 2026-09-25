// Odds words and payouts. Pure, no content imports (the client reads the tier words too).

export type Tier = 'LIKELY' | 'MAYBE' | 'RARE';

export function tierOf(chance: number): Tier {
  if (chance >= 50) return 'LIKELY';
  if (chance >= 20) return 'MAYBE';
  return 'RARE';
}

/** What a right call pays, × the stake: a little under fair odds (0.92 / chance), so the long
 *  shot pays big and the favourite pays little. Under ×2 to the tenth, above it to the half. */
export function payOf(chance: number): number {
  const fair = 92 / Math.max(1, chance);
  const pay = fair < 2 ? Math.round(fair * 10) / 10 : Math.round(fair * 2) / 2;
  return Math.max(1.1, pay);
}

/** The winnings for a right call: the stake back plus the profit, rounded down to whole coins. */
export function payout(amount: number, pay: number, grand: boolean): number {
  return Math.floor(amount * pay * (grand ? 2 : 1));
}
