// The one place the TV's reveal beats and the phone's hold are defined, so they can never drift:
// the phone shows an author's votes and points only after the TV has shown them (design-system
// rule 5: the phone never spoils). CSS tokens are not readable from JS, so the beats mirror
// --pb-motion-base / -slow the way Reveal.tsx's stepMs does.
import { useEffect, useState } from 'react';

/** TvReveal: voters at 300 ms, authors at 900 ms, points + outline + pill at 1500 ms. */
export const REVEAL_BEATS_MS = [0, 300, 900, 1500] as const;

/** The last TV beat plus its 300 ms pop; the phone's result appears after this. */
export const REVEAL_HOLD_MS = REVEAL_BEATS_MS[3] + 300;

/**
 * False for the first `ms` after mount, then true. Deliberately NOT collapsed by reduced motion:
 * this is sequencing against another device (the TV), not motion — a reduced-motion phone would
 * otherwise spoil the reveal for the room. Remount (a phase change) to restart it.
 */
export function useHold(ms: number): boolean {
  const [shown, setShown] = useState(ms <= 0);
  useEffect(() => {
    if (ms <= 0) return;
    const handle = setTimeout(() => setShown(true), ms);
    return () => clearTimeout(handle);
  }, [ms]);
  return shown;
}
