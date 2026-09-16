// Shared beats for the Lightning Round client. The phone imports these so it can never lead the
// TV (DESIGN_SYSTEM principle 5); when the TV reveal gains a choreography, raise the value here
// and have Tv.tsx import the same constant.

/**
 * How long the phone holds ✓/✗ and the outcome card after the reveal push: today the TV's reveal
 * rows finish their pb-rise at --pb-motion-base (300 ms), so the phone flips just after that.
 */
export const REVEAL_BEAT_MS = 300;
