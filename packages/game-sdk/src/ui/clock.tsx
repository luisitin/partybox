// Server-time awareness for the UI. Deadlines in views are SERVER timestamps; phones and TVs can be
// seconds off, so the shells measure the offset from every push and provide it here.
import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';
import type { JSX, ReactNode } from 'react';

const OffsetContext = createContext<number>(0);

export interface ServerClockProviderProps {
  /** serverNow - Date.now(), measured by the shell. */
  offsetMs: number;
  children: ReactNode;
}

export function ServerClockProvider({ offsetMs, children }: ServerClockProviderProps): JSX.Element {
  return <OffsetContext.Provider value={offsetMs}>{children}</OffsetContext.Provider>;
}

/** Current server time, re-rendering every `intervalMs`. */
/** Server time − this device's time (ms): compare a view's `deadline` with `Date.now() + offset`. */
export function useServerOffset(): number {
  return useContext(OffsetContext);
}

/** The last wall-clock reading any ticker took; every subscriber refreshes it on its own cadence. */
let latest = Date.now();

export function useServerNow(intervalMs = 250): number {
  const offset = useContext(OffsetContext);
  const subscribe = useCallback(
    (notify: () => void) => {
      // A new cadence reads the clock at once: a timer polls once a minute while paused, and on
      // resume the deadline has moved by the pause's length — counting from the tick taken before
      // the pause showed the held seconds plus the pause (18 for 11 on the review loop).
      latest = Date.now();
      notify();
      const handle = setInterval(() => {
        latest = Date.now();
        notify();
      }, intervalMs);
      return () => clearInterval(handle);
    },
    [intervalMs],
  );
  const tick = useSyncExternalStore(
    subscribe,
    () => latest,
    () => latest,
  );
  return tick + offset;
}

/**
 * Whole seconds left until `deadline` (never negative); null when there is no deadline.
 * `intervalMs`: how often to look — a countdown two screens show together polls finer (50 ms), so
 * their digits flip within a frame of each other instead of up to 250 ms apart (Bingo, loop 302).
 */
export function useSecondsLeft(
  deadline: number | null,
  paused = false,
  intervalMs = 250,
): number | null {
  const now = useServerNow(paused ? 60_000 : intervalMs);
  if (deadline === null) return null;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
