// I-089 C: how long this phone has to get back before the server drops it — the same 120 s grace,
// counted from the moment the phone saw its socket go.
//
// The interval owns the state (HostBar's `useVipAway` shape): render reads no ref and calls no
// clock, so the repo's react-hooks rules hold. The preview branch kept the timestamp in a ref.
import { useEffect, useState } from 'react';
import { LIMITS } from '@partybox/shared';

/** Seconds left of the disconnect grace, or null while the phone is connected. */
export function useGraceLeft(lost: boolean): number | null {
  const [tick, setTick] = useState<{ since: number | null; now: number }>({ since: null, now: 0 });
  // Back online: clear the count during render (React's adjust-state-during-render), so the effect
  // only ever owns the interval.
  if (!lost && tick.since !== null) setTick({ since: null, now: 0 });
  useEffect(() => {
    if (!lost) return undefined;
    const h = setInterval(
      () => setTick((t) => ({ since: t.since ?? Date.now(), now: Date.now() })),
      1000,
    );
    return () => clearInterval(h);
  }, [lost]);
  if (tick.since === null) return null;
  return Math.max(0, Math.round((tick.since + LIMITS.disconnectGraceMs - tick.now) / 1000));
}
