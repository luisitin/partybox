// The ready-up's timings, in a zod-free file so the phones and the TV can read them too (ADR-050:
// client code never pulls the server's schemas into its download).

/** The ready-up's longest wait [cc45f4]: after it the 3 · 2 · 1 starts with whoever is ready (the
 *  same numbers as Herd Mind's, so every game's start feels the same). */
export const INTRO_MS = 60_000;
/** "Everyone's ready" holds a breath before the 3 · 2 · 1, so the last Ready lands first. */
export const READY_BREATH_MS = 400;
/** The 3 · 2 · 1 before turn 1. */
export const COUNTDOWN_MS = 3_000;
