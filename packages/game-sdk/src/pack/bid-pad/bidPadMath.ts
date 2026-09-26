// BidPad's arithmetic, kept pure so it is tested without a DOM: a bid is a whole number from 0 to
// the coins you have; steppers move by `step`; a chip adds its amount; All in is everything.

/** Clamps any number to a legal bid: an integer from 0 to `max`. */
export function clampBid(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(0, Math.floor(max)), Math.max(0, Math.round(value)));
}

/** One stepper press: up or down by `step`, snapping to the step grid first ("37" + 5 → 40). */
export function stepBid(value: number, dir: 1 | -1, step: number, max: number): number {
  const s = Math.max(1, Math.round(step));
  const snapped = dir > 0 ? Math.floor(value / s) * s + s : Math.ceil(value / s) * s - s;
  return clampBid(snapped, max);
}

/** A quick chip: adds `amount`, never past `max`. */
export function addBid(value: number, amount: number, max: number): number {
  return clampBid(value + amount, max);
}

/** What each chip would make the bid, and whether it changes anything (a chip at the top is inert). */
export function chipTargets(
  value: number,
  chips: readonly number[],
  max: number,
): { amount: number; to: number; live: boolean }[] {
  return chips.map((amount) => {
    const to = addBid(value, amount, max);
    return { amount, to, live: to !== value };
  });
}
