// Keyed screen swap without the blank frame (review-loop #1): when `swapKey` changes, a static
// DOM snapshot of the outgoing screen stays on top and fades out over `--pb-motion-base` while the
// incoming one rises as before. A snapshot (cloneNode taken as the old screen unmounts), not a second
// React subtree, so no effect or sound cue ever runs twice. Reduced motion: no snapshot (the rise is
// 0 ms anyway).
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { usePrefersReducedMotion } from '@partybox/game-sdk/ui';
import styles from './CrossfadeSwap.module.css';

export interface CrossfadeSwapProps {
  swapKey: string;
  /** Class for the live container (layout + the rise animation). */
  className?: string;
  /** Keep the outgoing snapshot fully opaque while true (the incoming screen has nothing to show
   *  yet); the fade starts when it turns false. Capped at HOLD_MAX_MS (review-loop #10). */
  hold?: boolean;
  children: ReactNode;
}

/** ~`--pb-motion-base` plus a frame of slack before the snapshot is dropped. */
const GHOST_MS = 350;
const HOLD_MAX_MS = 1500;

/** The live screen; hands a clone of its DOM to the parent the moment it really unmounts. */
function Screen({
  className,
  onLeave,
  children,
}: {
  className?: string;
  onLeave: (snapshot: HTMLElement) => void;
  children: ReactNode;
}): JSX.Element {
  const node = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () => () => {
      // Layout cleanup runs while this subtree is still in the document. StrictMode also runs it
      // on a simulated unmount (dev only) with the node staying put: by the microtask a real
      // removal has happened and a fake one has not (review-loop #10).
      const el = node.current;
      if (!el || el.childElementCount === 0) return;
      const snapshot = el.cloneNode(true) as HTMLElement;
      queueMicrotask(() => {
        if (!el.isConnected) onLeave(snapshot);
      });
    },
    [onLeave],
  );
  return (
    <div ref={node} className={className}>
      {children}
    </div>
  );
}

export function CrossfadeSwap({
  swapKey,
  className,
  hold = false,
  children,
}: CrossfadeSwapProps): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);
  const [ghost, setGhost] = useState<HTMLElement | null>(null);
  // Stable on purpose: a changing callback would re-run Screen's cleanup on a LIVE screen.
  const onLeave = useCallback((snapshot: HTMLElement) => {
    if (!reducedRef.current) setGhost(snapshot);
  }, []);
  // A held ghost releases when `hold` drops or after HOLD_MAX_MS, whichever comes first.
  const [capped, setCapped] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!ghost || !hold) return;
    const cap = setTimeout(() => setCapped(ghost), HOLD_MAX_MS);
    return () => clearTimeout(cap);
  }, [ghost, hold]);
  const released = !hold || capped === ghost;
  useEffect(() => {
    if (!ghost || !released) return;
    const handle = setTimeout(() => setGhost(null), GHOST_MS);
    return () => clearTimeout(handle);
  }, [ghost, released]);
  return (
    <div className={styles.wrap}>
      {ghost ? (
        <div
          className={`${styles.ghost} ${released ? styles.ghostFade : ''}`}
          aria-hidden
          ref={(el) => {
            if (el && el.firstChild !== ghost) el.replaceChildren(ghost);
          }}
        />
      ) : null}
      <Screen key={swapKey} className={className} onLeave={onLeave}>
        {children}
      </Screen>
    </div>
  );
}
