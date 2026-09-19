// Downloads the background-music tracks the TV plays (lobby, Bingo, Broken Pencil, Wisecrack) into
// packages/client/public/music/ — served as static files, never bundled, git-ignored. All tracks
// are by Kevin MacLeod (incompetech.com), Creative Commons: By Attribution 4.0; the README carries
// the credit. Run by start-partybox.bat after the build and by `pnpm fetch-music`; skips files
// that already exist and never fails the launch — a missing track just means silence.
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'packages', 'client', 'public', 'music');
const BASE = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/';

/** id → incompetech title (the file name on their server). Ids are what music.ts plays. */
export const TRACKS: Record<string, string> = {
  'airport-lounge': 'Airport Lounge',
  'bossa-antigua': 'Bossa Antigua',
  'backbay-lounge': 'Backbay Lounge',
  'lobby-time': 'Lobby Time',
  'local-forecast-elevator': 'Local Forecast - Elevator',
  'george-street-shuffle': 'George Street Shuffle',
  'hep-cats': 'Hep Cats',
  'cool-vibes': 'Cool Vibes',
  wallpaper: 'Wallpaper',
  // Wisecrack's writing set (owner request 2026-09-18): playful, comic, never busy.
  'sneaky-snitch': 'Sneaky Snitch',
  'fluffing-a-duck': 'Fluffing a Duck',
  carefree: 'Carefree',
};

async function fetchTrack(id: string, title: string): Promise<'kept' | 'fetched' | 'failed'> {
  const file = join(OUT, `${id}.mp3`);
  if (existsSync(file) && statSync(file).size > 100_000) return 'kept';
  try {
    const res = await fetch(`${BASE}${encodeURIComponent(title)}.mp3`, {
      headers: { 'user-agent': 'PartyBox music fetch (CC BY 4.0, credited)' },
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length < 100_000) throw new Error('too small to be a track');
    writeFileSync(file, bytes);
    return 'fetched';
  } catch (err) {
    console.warn(`  ✖ ${title}: ${(err as Error).message}`);
    return 'failed';
  }
}

mkdirSync(OUT, { recursive: true });
const results = await Promise.all(
  Object.entries(TRACKS).map(([id, title]) => fetchTrack(id, title)),
);
const counts = { kept: 0, fetched: 0, failed: 0 };
for (const r of results) counts[r] += 1;
console.log(
  `music: ${counts.fetched} fetched, ${counts.kept} already there, ${counts.failed} failed → ${OUT}`,
);
if (counts.fetched > 0)
  console.log(
    '  Kevin MacLeod (incompetech.com) — Licensed under Creative Commons: By Attribution 4.0',
  );
