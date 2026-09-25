// READER-VOICES (ADR-045): play the stage's line once, the moment the host has made it — through
// the shell's sound graph (mute-aware; phones get `clip` only in a phone-only room). Once per
// mounted screen: the stage remounts with every phase, so "Close!" two rounds running is said
// twice, while a view pushed again within a phase never repeats its line.
import { useEffect, useRef } from 'react';
import { useSoundApi } from '@partybox/game-sdk/ui';
import type { Reading } from '../server/tv-view';

/** `delayMs` lets a cue lead the voice (the clue's card, then "Ana is the psychic"). */
export function useReading(reading: Reading | null, on = true, delayMs = 0): void {
  const sound = useSoundApi();
  const said = useRef(new Set<string>());
  const key = on ? (reading?.key ?? null) : null;
  const url = reading?.url ?? null;
  useEffect(() => {
    if (!key || !url || said.current.has(key)) return;
    said.current.add(key);
    sound.hush(); // never two readings at once
    sound.clip(url, { gain: 1, duck: false, ...(delayMs > 0 ? { delayMs } : {}) });
  }, [key, url, delayMs, sound]);
}
