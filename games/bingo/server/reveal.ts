// The claim reveal's beats: pure numbers the TV plays, the phone holds its verdict by (until
// the TV has shown it — DESIGN_SYSTEM principle 5) and the server sizes the check phase with,
// so all three agree from one file. Owner, 2026-09-17: "wait a
// second and say someone has a bingo, then display the card, then do the sweep slowly".
export const ANNOUNCE_MS = 1000; // "Sam says BINGO!" alone on the stage
export const DROP_MS = 700; // the card drops in with a bounce
export const STEP_MS = 350; // one pattern cell turns (a 5-cell line: 1.75 s)
/** Blackout turns 25 cells: quicker steps keep the line under 4 s. */
export const STEP_MANY_MS = 160;
export const LINE_HOLD_MS = 500; // a breath after the line
export const REST_MS = 1000; // every other tile takes its final look, slowly
export const HOLD_MS = 800; // suspense
/** The card settles into its column before the verdict pops beside it (= --pb-motion-slow). */
export const SETTLE_MS = 600;
/** The sweep sting fires when the first cell's colour lands (≈ 30 % of a 600 ms turn). */
export const STING_LAG_MS = 170;

/** When the verdict lands, from the claim: the phone shows nothing conclusive before this. */
export function verdictAtMs(patternCells: number, hasRest: boolean): number {
  const step = patternCells > 9 ? STEP_MANY_MS : STEP_MS;
  return (
    ANNOUNCE_MS +
    DROP_MS +
    patternCells * step +
    LINE_HOLD_MS +
    (hasRest ? REST_MS : 0) +
    HOLD_MS +
    SETTLE_MS
  );
}

/** After the verdict lands the room reads it: the check phase ends this long after. */
export const VERDICT_READ_MS = 3_000;

/** A wrong claim: the daubs lift off the TV's card this long after NOT A BINGO (I-006 B). */
// I-394 B: the verdict is read first — the wipe is the last beat before the 3 · 2 · 1 (it was
// 1.2 s in, and the words pointed at red squares that were gone for the last 1.8 s)
export const WIPE_AT_MS = 2_600;

/** I-117: a claim the room can see through — more never-called daubs than called ones on the
 *  checked line — gets no suspense. */
export function hopelessClaim(claim: {
  green: readonly number[];
  red: readonly number[];
}): boolean {
  return claim.red.length > claim.green.length;
}
/** The fast path's length: the announce, the drop, one turn for every cell together, a beat. */
export const HOPELESS_MS = ANNOUNCE_MS + DROP_MS + STEP_MS + HOLD_MS;

/** The reveal's length for one claim: its pattern cells, and whether other daubs rest in. */
export function claimRevealMs(
  cells: readonly number[],
  daubs: readonly number[],
  claim?: { green: readonly number[]; red: readonly number[] },
): number {
  if (claim && hopelessClaim(claim)) return HOPELESS_MS;
  return verdictAtMs(
    cells.length,
    daubs.some((i) => !cells.includes(i)),
  );
}

/** With nothing left to play for, the celebration ends by itself this long after it was read. */
export const AUTO_END_MS = 2_000;
