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
  // In tenths: 50 × 2.3 is 115, never 114.99999 floored to 114 (review C1).
  return Math.floor((amount * Math.round(pay * 10) * (grand ? 2 : 1)) / 10);
}

/** Insurance twist: 10 % of the stake (at least 1), paid for half the stake back if wrong. */
/** Peek twist: the price of ruling out one wrong option, scaled to how strong that hint is —
 *  one of two wrong options is worth far more than one of five (LIVE-EVENTS.md). Known up front:
 *  pricing by the option actually ruled out would leak which one it is. */
export function peekPrice(options: number): number {
  return Math.max(2, Math.ceil(25 / Math.max(1, options - 1)));
}

/** Split twist: the stake on each of the two picks (the odd coin rides on the first). */
export function splitHalves(amount: number): [number, number] {
  return [Math.ceil(amount / 2), Math.floor(amount / 2)];
}

export function insuranceFee(amount: number): number {
  return amount > 0 ? Math.max(1, Math.ceil(amount / 10)) : 0;
}

/** The biggest stake that fits `have` coins, the insurance fee included when insured. */
export function maxStake(have: number, insured: boolean): number {
  if (!insured) return Math.max(0, have);
  let a = Math.max(0, have);
  while (a > 0 && a + insuranceFee(a) > have) a--;
  return a;
}
