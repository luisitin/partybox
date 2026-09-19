// The background-music library the TV can play: ids are file names under /music/ (fetched by
// scripts/fetch-music.ts — keep the two lists identical). Kevin MacLeod (incompetech.com), CC BY 4.0.
export const TRACK_IDS = [
  'airport-lounge',
  'bossa-antigua',
  'backbay-lounge',
  'lobby-time',
  'local-forecast-elevator',
  'george-street-shuffle',
  'hep-cats',
  'cool-vibes',
  'wallpaper',
  'sneaky-snitch',
  'fluffing-a-duck',
  'carefree',
] as const;

/**
 * Per-track level trims (× the plan's volume) so the tracks of one set sit at one loudness.
 * Measured with packages/e2e/src/design/probe-loudness.ts (RMS dBFS, whole track): the Wisecrack
 * set — sneaky-snitch −19.4, fluffing-a-duck −18.8, carefree −23.1 — is evened to −19.4. The lobby,
 * Bingo and Broken Pencil sets keep the levels the owner heard and picked (airport-lounge −17.1,
 * bossa-antigua −23.4, local-forecast-elevator −24.8, george-street-shuffle −16.3, wallpaper −11.7,
 * cool-vibes −30.4, backbay-lounge −21.5, lobby-time −18.0, hep-cats −17.6).
 */
export const TRACK_TRIM: Partial<Record<(typeof TRACK_IDS)[number], number>> = {
  'fluffing-a-duck': 0.93,
  carefree: 1.53,
};
