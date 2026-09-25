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
/** The first number is never sooner than the deal plus that hold, whoever has picked. */
export function introMinMs(cards: number): number {
  return dealDoneMs(cards) + INTRO_BREATH_MS + PICKED_HOLD_MS + 600;
}
/**
 * Everyone has picked: "everyone has picked" holds this long, then the first number — no
 * count-in: the shell's start stage did READY and the 3 · 2 · 1 (ADR-053, reviewer 59a5f4)…
 */
export const PICKED_HOLD_MS = 1_000;
/** …after a breath for the last pick's lock tick (loop 349). */
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
/** Owner's pacing rule (Agent Hub #decisions cc45f4, 2026-09-25): "Enough time to read" — a
 *  screen of words stays up 1.5 s + 1/3 s a word, x1.3 because a Spanish phone or 200 % text
 *  reads longer (the server cannot see the phones' languages, so the margin is always on). */
export function readMs(words: number): number {
  return Math.round((1_500 + words * 333) * 1.3);
}
/** I-105 A: the vote after a bingo runs this long from its first choice — three options and the
 *  hint to read, then a moment to choose (was the note's six seconds; pacing rule 2026-09-25).
 *  Everyone voting still closes it at once. */
export const VOTE_MS = 15_000;
/** The between-rounds board: "Points", the next pattern's line (~8 words) and a name, place and
 *  score a player — 4 players ≈ 10.6 s, 12 ≈ 21 s (was a flat 6 s). Never under 10 s. */
export const SCOREBOARD_MIN_MS = 10_000;
export function scoreboardMs(players: number): number {
  return Math.max(SCOREBOARD_MIN_MS, readMs(8 + 3 * players));
}
export const DECK = 75;
export const FREE = 12;

/** The final board with the crown withheld ("and the winner is…") before the results fanfare. */
export const FINAL_MS = 4_000;
