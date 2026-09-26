// The start's timings, in a zod-free file so the phones and the TV can read them too (ADR-050:
// client code never pulls the server's schemas into its download).

/** Teams only: the roster card after the shell's start stage (ADR-053) — who is on which side and
 *  who plays first, while the first psychic's reading is made. No READY: the stage already had
 *  one; the VIP's Skip moves on at once. */
export const TEAMS_CARD_MS = 7_000;
