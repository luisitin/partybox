// Timing and voice helpers shared by the TV and the phone stage. Every beat runs from a server
// timestamp in the view (`stepAt`, `reading.at`), so every TV and phone lands it on the same frame
// however late its push arrived.
import { useEffect, useRef, useState } from 'react';
import { useServerOffset, useSoundApi } from '@partybox/game-sdk/ui';
import type { SoundCue } from '@partybox/game-sdk/ui';

/** ms since a server timestamp, on this device's clock. */
function sinceMs(at: number, offset: number): number {
  return Date.now() + offset - at;
}

/** True once `delayMs` has passed since the server time `at` (re-armed when `at` changes). */
export function useAfter(at: number, delayMs: number): boolean {
  const offset = useServerOffset();
  const [done, setDone] = useState(() => sinceMs(at, offset) >= delayMs);
  useEffect(() => {
    const left = delayMs - sinceMs(at, offset);
    if (left <= 0) {
      setDone(true);
      return undefined;
    }
    setDone(false);
    const handle = setTimeout(() => setDone(true), left);
    return () => clearTimeout(handle);
  }, [at, delayMs, offset]);
  return done;
}

/** Plays `url` once, when the server time `at` comes (never twice for the same key). Late by
 *  more than `staleMs` (a TV that reloaded mid-reveal) → skipped rather than talking over what
 *  comes next. */
export function useClipAt(
  url: string | null,
  at: number,
  { on = true, staleMs = 1_500 }: { on?: boolean; staleMs?: number } = {},
): void {
  const sound = useSoundApi();
  const offset = useServerOffset();
  const said = useRef(new Set<string>());
  useEffect(() => {
    if (!on || !url) return undefined;
    const key = `${url}@${at}`;
    if (said.current.has(key)) return undefined;
    const wait = at - (Date.now() + offset);
    if (wait < -staleMs) return undefined;
    const handle = setTimeout(
      () => {
        said.current.add(key);
        sound.hush(); // never two readings at once
        sound.clip(url, { gain: 1, duck: false });
      },
      Math.max(0, wait),
    );
    return () => clearTimeout(handle);
  }, [url, at, on, offset, sound]);
}

/** Plays a cue once when `key` first becomes true-ish (a step's stamp, a phase's entrance). */
export function useCueOnce(cue: SoundCue | null, key: string | null, gain = 1): void {
  const sound = useSoundApi();
  const played = useRef<string | null>(null);
  useEffect(() => {
    if (!cue || !key || played.current === key) return;
    played.current = key;
    sound.play(cue, { gain });
  }, [cue, key, gain, sound]);
}
