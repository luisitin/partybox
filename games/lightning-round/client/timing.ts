// Shared beats for the Lightning Round client. The phone imports these so it can never lead the
// TV (DESIGN_SYSTEM principle 5); when the TV reveal gains a choreography, raise the value here
// and have Tv.tsx import the same constant.

/**
 * How long the phone holds ✓/✗ and the outcome card after the reveal push: today the TV's reveal
 * rows finish their pb-rise at --pb-motion-base (300 ms), so the phone flips just after that.
 */
export const REVEAL_BEAT_MS = 300;

/**
 * Final reveal only: the phone shows "The bets are in — look at the TV" this long before its
 * outcome card, matching the TV's first verdict beat (R-051: rows at 0, ✓ on the answer at 900,
 * verdicts + deltas from 1200 ms). Tv.tsx must import this when that choreography lands.
 */
export const FINAL_REVEAL_HOLD_MS = 1200;

/**
 * I-589 B: a regular reveal shows the race (right answers fastest first, with times) this long,
 * then re-deals into the standings; the Next button (the owner's note) arrives with the standings.
 */
export const RACE_MS = 2000;
