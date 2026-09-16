// `prefers-reduced-motion` for JS-driven motion (CSS durations already collapse to 0 via tokens),
// and `useBeats` for sequenced reveals (a card, then the voters, then the author, then the points).
import { useEffect, useState, useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof matchMedia !== 'function') return () => undefined;
  const mql = matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function snapshot(): boolean {
  return typeof matchMedia === 'function' && matchMedia(QUERY).matches;
}

/** True when the viewer asked the OS for less motion; sequences should then show at once. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

/**
 * The index of the current beat of a client-side sequence: `useBeats([0, 300, 900, 1500])` is 0
 * at mount, 1 after 300 ms, … and stays at the last index. Under reduced motion it is the last
 * index from the first render, so everything shows at once. Remount (a `key`) to restart it.
 */
export function useBeats(atMs: readonly number[]): number {
  const reduced = usePrefersReducedMotion();
  const last = Math.max(0, atMs.length - 1);
  const [beat, setBeat] = useState(reduced ? last : atMs[0] === 0 ? 0 : -1);
  // The schedule is fixed per mount (callers pass a literal array); only `reduced` can change.
  useEffect(() => {
    if (reduced) return;
    const handles = atMs.map((ms, i) => setTimeout(() => setBeat((b) => Math.max(b, i)), ms));
    return () => handles.forEach((h) => clearTimeout(h));
  }, [reduced]);
  return reduced ? last : beat;
}
