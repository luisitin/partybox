// Echo's rules both sides need, with no imports: the phone and TV bundles take them from here, so
// server code (and zod) never rides into a client chunk (ADR-050).

export const CLUE_MAX_CHARS = 20;

export type RatingId = 'flawless' | 'brilliant' | 'great' | 'solid' | 'warming' | 'again';

export const RATINGS: { id: RatingId; icon: string; label: string; min: number }[] = [
  { id: 'flawless', icon: '🏆', label: 'Flawless', min: 1 },
  { id: 'brilliant', icon: '🌟', label: 'Brilliant', min: 0.85 },
  { id: 'great', icon: '🎉', label: 'Great', min: 0.7 },
  { id: 'solid', icon: '👍', label: 'Solid', min: 0.55 },
  { id: 'warming', icon: '🔥', label: 'Warming up', min: 0.3 },
  { id: 'again', icon: '🔁', label: 'Try again!', min: 0 },
];

export function ratingOf(won: number, deckSize: number): RatingId {
  const share = deckSize > 0 ? won / deckSize : 0;
  if (won >= deckSize && deckSize > 0) return 'flawless';
  for (const r of RATINGS.slice(1)) if (share >= r.min) return r.id;
  return 'again';
}

/** Great or better is a win: everyone is crowned (§7.7). */
export function crowns(rating: RatingId): boolean {
  return rating === 'flawless' || rating === 'brilliant' || rating === 'great';
}

/** The TV's guess reveal: echoes go blank, then one survivor turns over per step. */
export const GUESS_BEATS = {
  deal: 0,
  dealStep: 90,
  echoFlip: 700,
  firstSurvivor: 1300,
  survivorStep: 420,
};
/** After the last card turns: time for the reading to finish before an early guess lands. */
export const GUESS_TAIL_MS = 1_400;

/** One survivor per step; with a reading, the steps follow the voice (420–900 ms each). */
export function survivorStepMs(survivors: number, readingMs: number | null | undefined): number {
  if (!readingMs || readingMs <= 0 || survivors <= 0) return GUESS_BEATS.survivorStep;
  return Math.round(Math.min(900, Math.max(GUESS_BEATS.survivorStep, readingMs / survivors)));
}

/** How long the TV needs to show `survivors` clues before a guess may end the phase. */
export function guessShowMs(survivors: number, readingMs?: number | null): number {
  const last =
    survivors > 0
      ? GUESS_BEATS.firstSurvivor + (survivors - 1) * survivorStepMs(survivors, readingMs)
      : GUESS_BEATS.echoFlip;
  return last + GUESS_TAIL_MS;
}
