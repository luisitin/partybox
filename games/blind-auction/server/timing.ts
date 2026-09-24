// Every duration Blind Auction paces itself by (SPEC §8.4, §8.6). Pure constants, shared by the
// reducer and the TV so the stage's choreography lands on the server's beats. No content imports.

export const INTRO_MS = 8_000;
/** `lot`: the card lands, then the reading starts (the TV delays the voice by this much). */
export const LOT_LEAD_MS = 700;
/** `lot` after the reading ends, before bidding opens. */
export const LOT_TAIL_MS = 1_000;
/** `lot` never lasts longer than this, voice or not. */
export const LOT_MAX_MS = 10_000;
/** `lot` with no reader: time to read the name and flavour line. */
export const LOT_SILENT_MS = 6_000;

/** Live bidding (§8.6): stage 0 after a bid, then "Going once…", "Going twice…", "SOLD!". */
export const LIVE_STAGE_MS = [3_000, 2_000, 2_000] as const;
/** Live: a lot nobody bids on is unsold after this long. */
export const LIVE_NO_BIDS_MS = 8_000;
/** Live: this long after the lot opens, the next stage is SOLD. */
export const LIVE_CAP_MS = 40_000;
export const LIVE_OPENING_BID = 5;

/** `sold` (sealed): the ladder starts after this beat… */
export const LADDER_LEAD_MS = 900;
/** …one bid every 0.4 s, lowest first (a long ladder closes up so it never passes 4 s)… */
export const LADDER_STEP_MS = 400;
export const LADDER_MAX_MS = 4_000;
export function ladderStepMs(bids: number): number {
  return bids <= 0 ? 0 : Math.min(LADDER_STEP_MS, Math.floor(LADDER_MAX_MS / bids));
}
/** …a tie line holds before the stamp… */
export const TIE_HOLD_MS = 1_200;
/** …and the stamp stays up this long before the card flips. */
export const SOLD_HOLD_MS = 2_600;
/** `sold` in Live mode: the hammer falls on the final bid. */
export const HAMMER_MS = 700;
/** "No takers!" holds this long. */
export const UNSOLD_HOLD_MS = 2_600;

/** `flip`: the card turns; its fixed line ("Jackpot!") and cue land as it finishes turning… */
export const FLIP_LINE_AT_MS = 850;
/** …step 1 (own lines, strip coins) follows… */
export const FLIP_TURN_MS = 1_300;
/** …then the phones get their own line and the coins move; the whole phase is about 6 s. */
export const FLIP_HOLD_MS = 5_000;
/** A reading that arrives this late still gets to finish before the next lot (at most). */
export const FLIP_VOICE_MAX_MS = 6_000;
/** After any reading, a beat before the next thing starts. */
export const VOICE_BEAT_MS = 600;
