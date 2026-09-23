// READER-VOICES (ADR-045): play the room's reading once, the moment it is up — the question while
// answers come in, then each card as it is revealed. The host made it (`view.speech`); the stage's
// pacing already waits for it and a beat. Mute-aware like every clip (the shell's sound API).
import { useEffect, useRef } from 'react';
import { useSoundApi } from '@partybox/game-sdk/ui';

export function useReading(speech: { key: string; url: string } | null, on = true): void {
  const sound = useSoundApi();
  const said = useRef(new Set<string>());
  const key = on ? (speech?.key ?? null) : null;
  const url = speech?.url ?? null;
  useEffect(() => {
    if (!key || !url || said.current.has(key)) return;
    said.current.add(key);
    sound.hush(); // never two readings at once
    // No duck: the music stays quietly under the reading (the owner, 2026-09-23).
    sound.clip(url, { gain: 1, duck: false });
  }, [key, url, sound]);
}
