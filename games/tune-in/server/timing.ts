// The ready-up's timings, in a zod-free file so the phones and the TV can read them too (ADR-050:
// client code never pulls the server's schemas into its download).

/** The ready-up's safety net [cc45f4]: a room where nobody has tapped I'm ready (nobody is looking)
 *  starts after this. Once anyone has tapped, the net waits for the rest instead ([a9623e]). */
export const INTRO_MS = 60_000;
/** ... up to here: a phone that still hasn't tapped after 10 minutes (left on a table) no longer
 *  holds the room. */
export const INTRO_GIVE_UP_MS = 10 * 60_000;
/** "Everyone's ready" holds a breath before the 3 · 2 · 1, so the last Ready lands first. */
export const READY_BREATH_MS = 400;
/** The 3 · 2 · 1 before turn 1. */
export const COUNTDOWN_MS = 3_000;
