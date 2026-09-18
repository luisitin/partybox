// Haptics for the phone: a short buzz is the most accessible non-visual confirmation in a loud
// room. Android Chrome only (iOS Safari has no navigator.vibrate; calls before the page's first
// user activation are dropped) — so the visual press state stays the load-bearing feedback and
// every call here is fire-and-forget. Not gated on prefers-reduced-motion (a 20 ms buzz is not
// animation); the player can switch it off (`partybox:haptics`, default on).
import { trace } from './trace';

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

/** When the pattern now running ends (`navigator.vibrate` replaces, it never queues). */
let busyUntil = 0;

/**
 * Vibrate for `pattern` ms (or an on/off pattern); silently a no-op where unsupported. A shorter
 * buzz never cuts a longer one still running: the shell's 20 ms "locked in" tick used to land on
 * the same tick as a winner's 320 ms celebration and replace it (loop 334). A pattern at least as
 * long as what is left takes over (an error over a tap).
 */
export function buzz(pattern: number | number[]): void {
  const total = Array.isArray(pattern) ? pattern.reduce((a, b) => a + b, 0) : pattern;
  const now = performance.now();
  if (now < busyUntil && total < busyUntil - now) {
    trace('buzz:dropped', { pattern });
    return;
  }
  busyUntil = now + total;
  trace('buzz', { pattern });
  if (!hapticsEnabled()) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
