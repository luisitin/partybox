// The TV's choreography clock, shared by the reducer (deadlines) and the client (when each beat
// plays), so a phase never ends mid-animation and a voice lands on its frame. Pure constants.

/** `herd`: the question slides up, then the answer cards land one by one into their columns. */
export const HERD_OPEN_MS = 450;
export const CARD_LAND_MS = 450;
/** Cards land within this window whatever the head count (16 players still finish in time). */
const LAND_WINDOW_MS = 2_300;
const MAX_STAGGER_MS = 170;

export function cardStaggerMs(cards: number): number {
  return cards <= 1 ? 0 : Math.min(MAX_STAGGER_MS, Math.floor(LAND_WINDOW_MS / (cards - 1)));
}

/** When card `i` (0-based, in landing order) starts to fly in. */
export function cardAtMs(i: number, cards: number): number {
  return HERD_OPEN_MS + i * cardStaggerMs(cards);
}

/** The herd rises (or the tie shakes) once the last card has landed and settled. */
export function bannerAtMs(cards: number): number {
  return cardAtMs(Math.max(0, cards - 1), cards) + CARD_LAND_MS + 250;
}

/** How long the verdict holds after the banner: long enough to read it, and for its voice. */
export const BANNER_HOLD_MS = 2_600;
export const VOICE_BEAT_MS = 700;

/** The whole tiles-mode `herd` phase: the landing, the banner, and the hold (voice-aware). */
export function herdMs(cards: number, readingMs: number | null): number {
  const hold =
    readingMs !== null && readingMs > 0
      ? Math.max(BANNER_HOLD_MS, readingMs + VOICE_BEAT_MS)
      : BANNER_HOLD_MS;
  return bannerAtMs(cards) + hold;
}

/** `score`: +1 badges pop, then the sheep flies, then the race track slides. */
export const PLUS_AT_MS = 250;
export const SHEEP_AT_MS = 900;
export const SHEEP_FLIGHT_MS = 1_100;
export const RACE_AT_MS = 1_500;
export const WIN_BANNER_AT_MS = 2_300;
