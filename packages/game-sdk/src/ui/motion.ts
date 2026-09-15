// `prefers-reduced-motion` for JS-driven motion (CSS durations already collapse to 0 via tokens).
import { useSyncExternalStore } from 'react';

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
