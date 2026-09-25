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
  // The shell game's cups lift at `open`: the ball shows under the right one.
  shells: 1_400,
  // The coin flips one flip at a time (COIN_FLIP_MS each) until tails, then a beat.
  coins: 5_800,
  // Keno: five balls drop, KENO_BALL_MS apart, then a beat.
  keno: 5_600,
  // The run-up, the kick, the dive, the net (or not).
  penalty: 3_800,
  // A room / a wire every REVEAL_STEP_MS until the ghost / the bomb's fate, then a beat.
  ghost: 5_400,
  wires: 5_400,
  // The dealer turns the hole card and draws, a card at a time.
  blackjack: 4_200,
} as const;
/** Blackjack: time to hit or stand. */
export const HANDS_MS = 20_000;
/** Blackjack at `open`: one dealer card every DEAL_MS. */
export const DEAL_MS = 700;
/** Ghost hunt and defuse the bomb: one room or wire checked per step. */
export const REVEAL_STEP_MS = 1_100;
/** Coin-flip streak: one flip on the TV. */
export const COIN_FLIP_MS = 900;
/** Keno (the owner: like KENO, Bingo-style balls, a tray, the payouts clear up front): pick
 *  KENO_PICKS of KENO_NUMBERS; KENO_DRAW balls are drawn; the stake pays KENO_PAY[matches] ×
 *  (1 match gives the stake back; the table averages about 1.02, like the boxes' odds). */
export const KENO_NUMBERS = 20;
export const KENO_PICKS = 3;
export const KENO_DRAW = 5;
export const KENO_PAY = [0, 1, 2.2, 30] as const;
export const KENO_BALL_MS = 950;
/** Shell game: speed tiers by how much of the room's coins went into the pot (share of seats ×
 *  start coins): ×1, ×2, ×3, ×5, ×8, ×10 — the owner's breakpoints. */
export const SHELL_TIER_AT = [0, 0.1, 0.2, 0.35, 0.5, 0.7] as const;
export const SHELL_SPEED = [1, 2, 3, 5, 8, 10] as const;
/** One swap at ×1; the lead (ball shown, cups down) and the tail before the pick. */
export const SHELL_SWAP_MS = 560;
export const SHELL_LEAD_MS = 2_200;
export const SHELL_TAIL_MS = 600;
/** Swaps per shuffle: a base, plus more at higher tiers. */
export function shellSwaps(tier: number): number {
  return 8 + tier * 3;
}
export function shuffleMs(tier: number): number {
  const speed = SHELL_SPEED[tier] ?? 1;
  return SHELL_LEAD_MS + Math.ceil((shellSwaps(tier) * SHELL_SWAP_MS) / speed) + SHELL_TAIL_MS;
}
/** `cups`: everyone who staked picks a cup. */
export const CUPS_MS = 10_000;
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
