// When the TV strip may show running totals (R-068): a game's `stripScores` answers yes, no, or
// "after this many ms of the phase" — the stage's own beat (Blanks' result names the winner at
// 1200 ms; the strip used to hold its old numbers for the whole result, retro 0ac5d8).
import { useEffect, useState } from 'react';

/** Pure core: whether the strip shows scores `msInPhase` after the phase started on this TV. */
export function stripScoresShown(rule: boolean | number, msInPhase: number): boolean {
  return typeof rule === 'boolean' ? rule : msInPhase >= rule;
}

/**
 * The rule held against this TV's own clock: a delay starts when `phaseKey` changes and one timer
 * re-renders when it runs out. A boolean rule passes straight through.
 */
export function useStripScores(phaseKey: string, rule: boolean | number): boolean {
  const [released, setReleased] = useState<string | null>(null);
  const delay = typeof rule === 'number' ? Math.max(0, rule) : null;
  useEffect(() => {
    if (delay === null) return;
    const handle = setTimeout(() => setReleased(phaseKey), delay);
    return () => clearTimeout(handle);
  }, [phaseKey, delay]);
  if (delay === null) return rule === true;
  return released === phaseKey || delay === 0;
}
