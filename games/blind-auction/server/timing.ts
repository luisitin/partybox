// Every duration Blind Auction paces itself by. Pure constants, shared by the reducer and the TV so
// the stage's choreography lands on the server's beats. No content imports.

/** `rules`: nobody is hurried (no clock shown); after this long an idle phone stops holding the room. */
export const RULES_SAFETY_MS = 180_000;
/** …and once someone is ready it waits for the rest, but not past this: that phone has gone. */
export const RULES_GIVE_UP_MS = 600_000;
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
export const EVENT_MS = {
  race: 7_000,
  dice: 2_600,
  wheel: 5_600,
  doors: 2_400,
  // The potato has already popped live (`potato`): the reveal only shows who got burnt.
  potato: 600,
  // Tug of war is pulled live (`tug`): the reveal only names the winning side.
  tug: 600,
} as const;
/** Tug of war: the pull lasts this long at most; a counted tap moves the rope TUG_STEP × your
 *  share of your team's stake; taps closer than TUG_TAP_MS are one tap. */
export const TUG_MS = 12_000;
// Tuned on a 6-player recording: at 0.035 the rope barely left the middle in 12 s.
export const TUG_STEP = 0.06;
export const TUG_TAP_MS = 80;
/** Hot potato: it pops between these (ms, secret), checked every POTATO_TICK_MS; a holder must
 *  hold it this long before a pass counts; the burnt holder loses POTATO_BURN coins. */
export const POTATO_MIN_MS = 3_000;
export const POTATO_MAX_MS = 30_000;
export const POTATO_TICK_MS = 500;
export const POTATO_HOLD_MS = 400;
/** Bots hold it about as long as a person takes to look and tap. */
export const POTATO_BOT_HOLD_MS = 1_100;
export const POTATO_BURN = 10;
/** The owner: people had no time to react — every pass stops the pop clock this long. */
export const POTATO_GRACE_MS = 250;
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
