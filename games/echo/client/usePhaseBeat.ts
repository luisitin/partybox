// Which beat of a phase's choreography is showing, by server time: a TV (or phone) that mounts
// mid-phase — a reload, a late join — lands on the right beat instead of replaying the show.
// Sequencing, not decoration: it runs under reduced motion too (only the movement is dropped).
import { useEffect, useState } from 'react';
import { useServerOffset } from '@partybox/game-sdk/ui';

export function beatAt(elapsed: number, atMs: readonly number[]): number {
  let beat = 0;
  atMs.forEach((t, i) => {
    if (elapsed >= t) beat = i;
  });
  return beat;
}

/**
 * `atMs` must be ascending and start at 0; returns the index of the latest beat reached. Key the
 * component by the phase instance: the first render reads the clock, later beats come by timer.
 */
export function usePhaseBeat(startedAt: number, atMs: readonly number[]): number {
  const offset = useServerOffset();
  const [beat, setBeat] = useState(() => beatAt(Date.now() + offset - startedAt, atMs));
  const signature = atMs.join(',');
  useEffect(() => {
    const elapsed = Date.now() + offset - startedAt;
    const timers = signature
      .split(',')
      .map((t, i) => ({ t: Number(t) - elapsed, i }))
      .filter((x) => x.t > 0)
      .map((x) => setTimeout(() => setBeat(x.i), x.t));
    return () => timers.forEach(clearTimeout);
  }, [startedAt, offset, signature]);
  return beat;
}

/** Milliseconds since the phase began, read once at mount (for CSS delays that must skip ahead). */
export function useMountElapsed(startedAt: number): number {
  const offset = useServerOffset();
  const [elapsed] = useState(() => Math.max(0, Date.now() + offset - startedAt));
  return elapsed;
}
