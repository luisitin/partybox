// READER-VOICES (ADR-045): play the stage's line once, the moment the host has made it — through
// the shell's sound graph (mute-aware; phones get `clip` only in a phone-only room). A phase that
// remounts (the stage cuts into each phase) never says the same line twice within a minute; a
// later game that happens to need the same line still hears it.
import { useEffect } from 'react';
import { useSoundApi } from '@partybox/game-sdk/ui';
import type { Reading } from '../server/tv-view';

const REPEAT_AFTER_MS = 60_000;
const saidAt = new Map<string, number>();

function fresh(key: string): boolean {
  const at = saidAt.get(key);
  return at === undefined || performance.now() - at > REPEAT_AFTER_MS;
}

/** `delayMs` lets a cue lead the voice (the clue's card, then "Ana is the psychic"). */
export function useReading(reading: Reading | null, on = true, delayMs = 0): void {
  const sound = useSoundApi();
  const key = on ? (reading?.key ?? null) : null;
  const url = reading?.url ?? null;
  useEffect(() => {
    if (!key || !url || !fresh(key)) return;
    saidAt.set(key, performance.now());
    sound.hush(); // never two readings at once
    sound.clip(url, { gain: 1, duck: false, ...(delayMs > 0 ? { delayMs } : {}) });
  }, [key, url, delayMs, sound]);
}
