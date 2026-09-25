// When the TV strip may show running totals (R-068): a game's `stripScores` answers yes, no, or
// "after this many ms of the phase" — the stage's own beat (Blanks' result names the winner at
// 1200 ms; the strip used to hold its old numbers for the whole result, retro 0ac5d8).
import { useEffect, useState } from 'react';

/** The strip rule for this view: the game's own once its TV module has loaded (no rule = show);
 *  held while it loads or before the first view, so nothing is stored from a guessed rule. */
export function stripRuleFor<V>(
  view: V | null | undefined,
  rule: ((view: V) => boolean | number) | undefined,
  loaded: boolean,
): boolean | number {
  if (!view || !loaded) return false;
  return rule ? rule(view) : true;
}

/** One phase's hold: which phase it is for, and whether its delay has run out. */
export interface StripHold {
  key: string;
  released: boolean;
}

/** A new phase starts a new hold; the same phase keeps its own. Pure, so every round's result is
 *  held afresh — round 2's result never inherits round 1's release (foundation 8e00d0). */
export function holdFor(prev: StripHold, phaseKey: string): StripHold {
  return prev.key === phaseKey ? prev : { key: phaseKey, released: false };
}

/** The delay ran out: release the hold only if it is still the same phase. */
export function releaseHold(prev: StripHold, phaseKey: string): StripHold {
  return prev.key === phaseKey ? { ...prev, released: true } : prev;
}

/**
 * The rule held against this TV's own clock: a delay starts when `phaseKey` changes (or when the
 * TV mounts mid-phase — a TV that reloads during a result holds another `rule` ms from then) and
 * one timer releases it. A boolean rule passes straight through.
 */
export function useStripScores(phaseKey: string, rule: boolean | number): boolean {
  const [hold, setHold] = useState<StripHold>({ key: phaseKey, released: false });
  const current = holdFor(hold, phaseKey);
  if (current !== hold) setHold(current); // render-time reset, as TvApp does for gameReady
  const delay = typeof rule === 'number' ? Math.max(0, rule) : null;
  useEffect(() => {
    if (delay === null) return;
    const handle = setTimeout(() => setHold((h) => releaseHold(h, phaseKey)), delay);
    return () => clearTimeout(handle);
  }, [phaseKey, delay]);
  if (delay === null) return rule === true;
  return current.released || delay === 0;
}
