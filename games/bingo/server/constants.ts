// Bingo's pacing and board constants: pure numbers the server, the phones and the TV all read.
// No zod here (types.ts holds the input schemas), so the client entries stay free of it (ADR-050).

/** The card-pick step's longest wait (loop 344); everyone ready ends it sooner. */
export const INTRO_MS = 15_000;
/**
 * The deal (loop 345 — the owner: "slow it down, about a second a card"): the first card lands
 * DEAL_START_MS in, each next one DEAL_STEP_MS later, the pluck DEAL_BOUNCE_MS after each landing.
 * Mirrored by the phones' and the TV's animations (Controller.module.css, TvCountdown.tsx).
 */
export const DEAL_START_MS = 400;
export const DEAL_STEP_MS = 1_000;
export const DEAL_BOUNCE_MS = 250;
/** When the last card is down, for `cards` per player. */
export function dealDoneMs(cards: number): number {
  return DEAL_START_MS + Math.max(0, cards - 1) * DEAL_STEP_MS + DEAL_BOUNCE_MS + 300;
}
/** The first number is never sooner than the deal plus the 3 · 2 · 1, whoever is ready. */
export function introMinMs(cards: number): number {
  return dealDoneMs(cards) + INTRO_BREATH_MS + INTRO_READY_MS + 600;
}
/** Everyone ready: the first number is this far away (the 3 · 2 · 1)… */
export const INTRO_READY_MS = 3_000;
/**
 * …after a breath: the last Ready's lock tick and the ring's first tick were 30 ms apart (loop
 * 349); "everyone is ready" holds this long before the 3 · 2 · 1 starts.
 */
export const INTRO_BREATH_MS = 400;
/** The dibs window after the first BINGO! tap. */
export const ARM_MS = 3_000;
/** The 3 · 2 · 1 after the last card-style menu closes. */
export const RESUME_MS = 3_000;
/** No winner (the deck ran out): the TV says so for this long. */
export const BINGO_MS = 10_000;
/**
 * With a winner the celebration is not paced: it waits for a phone. This is only a safety valve
 * so an abandoned room (a bots-only game) does not sit on the verdict forever.
 */
export const BINGO_ABANDONED_MS = 5 * 60_000;
/** I-400 A: after the verdict is read, nobody picking for this long moves the room on. */
export const NO_PICK_MS = 20_000;
/** I-105 A: the vote after a bingo runs this long from its first choice (the note's six seconds). */
export const VOTE_MS = 6_000;
export const SCOREBOARD_MS = 6_000;
export const DECK = 75;
export const FREE = 12;

/** The final board with the crown withheld ("and the winner is…") before the results fanfare. */
export const FINAL_MS = 4_000;
