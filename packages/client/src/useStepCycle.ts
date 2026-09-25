// The how-to-play steps light up one after another while the room reads them (the TV's spotlight
// and chosen card): a reading-along cue that also keeps the stage from freezing (record-review:
// no dead air). Off under reduced motion — then every step stays lit.
import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@partybox/game-sdk/ui';

/** How long each step stays lit. */
export const STEP_MS = 1800;

/** The lit step's index, or null when the cycle is off (every step lit). */
export function useStepCycle(active: boolean, count = 3): number | null {
  const reduced = usePrefersReducedMotion();
  const on = active && !reduced && count > 1;
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!on) return undefined;
    const h = setInterval(() => setStep((s) => (s + 1) % count), STEP_MS);
    return () => clearInterval(h);
  }, [on, count]);
  return on ? step % count : null;
}
