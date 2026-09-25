// Every duration Blind Auction paces itself by. Pure constants, shared by the reducer and the TV so
// the stage's choreography lands on the server's beats. No content imports.

/** `rules`: everyone reads the three steps and taps Ready; this long at most. */
export const RULES_MS = 40_000;
/** `rules` step 1: the 3·2·1 once everyone is ready. */
export const COUNTDOWN_MS = 3_000;

/** `box`: the box lands, then the reading starts (the TV delays the voice by this much). */
export const BOX_LEAD_MS = 700;
/** `box` after the reading ends, before betting opens. */
export const BOX_TAIL_MS = 1_000;
/** `box` never lasts longer than this, voice or not. */
export const BOX_MAX_MS = 10_000;
/** `box` with no reader: time to read the name, the flavour line and the odds. */
export const BOX_SILENT_MS = 6_000;

/** `open` step 0: the bets land on the table, one every `BET_STEP_MS` after a beat… */
export const BETS_LEAD_MS = 900;
export const BET_STEP_MS = 300;
export const BETS_MAX_MS = 3_000;
export function betsMs(bets: number): number {
  return BETS_LEAD_MS + Math.min(BETS_MAX_MS, bets * BET_STEP_MS);
}
/** …step 1: the box turns (its outcome's fixed line lands as it finishes turning)… */
export const OPEN_LINE_AT_MS = 850;
/** A live event plays out on the TV at step 0 of `open`, after the bets land: this long. */
export const EVENT_MS = { race: 7_000, dice: 2_600, wheel: 5_600, doors: 2_400 } as const;
/** Doors: after the host opens a goat door, everyone gets this long to stay or switch. */
export const SWAP_MS = 12_000;
/** …and the payouts hold this long (longer if the reading needs it). */
export const OPEN_HOLD_MS = 5_500;
/** A reading may keep the box open this much longer at most. */
export const OPEN_VOICE_MAX_MS = 5_000;
/** After any reading, a beat before the next thing starts. */
export const VOICE_BEAT_MS = 600;

/** A player with no coins left gets this much to bet with, so nobody spends the game watching. */
export const PITY_COINS = 10;
