// Server-time awareness for the UI. Deadlines in views are SERVER timestamps; phones and TVs can be
// seconds off, so the shells measure the offset from every push and provide it here.
import { createContext, useContext, useEffect, useState } from 'react';
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
export function useServerNow(intervalMs = 250): number {
  const offset = useContext(OffsetContext);
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const handle = setInterval(() => setTick(Date.now()), intervalMs);
    return () => clearInterval(handle);
  }, [intervalMs]);
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
