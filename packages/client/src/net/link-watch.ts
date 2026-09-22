// Is the link really alive? A dead socket is invisible for up to the 20 s ping timeout
// (review-loop #4): the phone kept a green dot and a stale call through a whole 8 s drop. Two
// earlier signals say "gone": the browser's own `offline` event, and a deadline that passed more
// than 2 s ago with no push since (the server always pushes when a timer fires).
//
// The owner (2026-09-22): a phone coming back could sit in a "Reconnecting…" flicker loop — the
// watchdog killed the fresh socket a second after every reconnect, because a deadline that passed
// while the phone was away stays passed until the server's next push. Hence the two guards below:
// never inside GRACE of a connect, and never twice inside COOLDOWN. The browser's `offline` event
// is not a guess, so it skips them.
const STALE_GRACE_MS = 5000;
const STALE_COOLDOWN_MS = 10_000;

export interface LinkWatch {
  /** Call on every socket `connect`. */
  onConnect(): void;
  /** The watchdog's guess: true when the caller should flip to reconnecting and kick the socket. */
  shouldGoStale(joined: boolean, reconnecting: boolean): boolean;
  /** The browser's own offline event: always acts, and arms the cooldown. */
  onOffline(): void;
}

export function createLinkWatch(now: () => number = Date.now): LinkWatch {
  let lastConnectAt = 0;
  // -Infinity, not 0: the first real stale must not be swallowed by a cooldown that never ran.
  let lastStaleAt = Number.NEGATIVE_INFINITY;
  return {
    onConnect: () => {
      lastConnectAt = now();
    },
    shouldGoStale: (joined, reconnecting) => {
      if (!joined || reconnecting) return false;
      const t = now();
      if (t - lastConnectAt < STALE_GRACE_MS || t - lastStaleAt < STALE_COOLDOWN_MS) return false;
      lastStaleAt = t;
      return true;
    },
    onOffline: () => {
      lastStaleAt = now();
    },
  };
}
