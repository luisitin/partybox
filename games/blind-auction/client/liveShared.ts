// What the live-event stages share: their props and the frame-driven progress clock.
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@partybox/game-sdk/ui';
import type { OptionView, RunView } from '../server/views';

export interface Props {
  run: RunView;
  options: OptionView[];
  /** Bets on the table: the event starts once they have landed. */
  bets: number;
}

/** 0 before the start, then 0…1 over `ms`, driven by animation frames. */
export function useProgress(delay: number, ms: number): number {
  const reduced = useReducedMotion();
  const [p, setP] = useState(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    const t0 = performance.now() + delay;
    let raf = 0;
    const tick = (now: number): void => {
      const next = Math.max(0, Math.min(1, (now - t0) / ms));
      setP(next);
      if (next < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [delay, ms, reduced]);
  return p;
}
