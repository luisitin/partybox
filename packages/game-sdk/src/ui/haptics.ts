// Haptics for the phone: a short buzz is the most accessible non-visual confirmation in a loud
// room. Android Chrome only (iOS Safari has no navigator.vibrate; calls before the page's first
// user activation are dropped) — so the visual press state stays the load-bearing feedback and
// every call here is fire-and-forget. Not gated on prefers-reduced-motion (a 20 ms buzz is not
// animation); the player can switch it off (`partybox:haptics`, default on).
const KEY = 'partybox:haptics';

export function hapticsEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}

export function setHapticsEnabled(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* private mode */
  }
}

/** Vibrate for `pattern` ms (or an on/off pattern); silently a no-op where unsupported. */
export function buzz(pattern: number | number[]): void {
  if (!hapticsEnabled()) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
