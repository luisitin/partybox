// Keyed screen swap without the blank frame (review-loop #1): when `swapKey` changes, a static
// DOM snapshot of the outgoing screen stays on top and fades out over `--pb-motion-base` while the
// incoming one rises as before. A snapshot (cloneNode taken as the old screen unmounts), not a second
// React subtree, so no effect or sound cue ever runs twice. The ghost is appended imperatively in
// the unmount's microtask — before the next paint — because a state update would land a frame
// later and leave one blank frame (review-loop #26). Reduced motion: no snapshot.
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { JSX, ReactNode } from 'react';
import { sanitizeSnapshot, usePrefersReducedMotion } from '@partybox/game-sdk/ui';
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
const GHOST = styles['ghost'] ?? 'ghost';
const GHOST_FADE = styles['ghostFade'] ?? 'ghostFade';

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
      const snapshot = sanitizeSnapshot(el.cloneNode(true) as HTMLElement);
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

interface Ghost {
  host: HTMLElement;
  timer: ReturnType<typeof setTimeout> | null;
}

export function CrossfadeSwap({
  swapKey,
  className,
  hold = false,
  children,
}: CrossfadeSwapProps): JSX.Element {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(reduced);
  const holdRef = useRef(hold);
  useEffect(() => {
    reducedRef.current = reduced;
    holdRef.current = hold;
  }, [reduced, hold]);
  /** The current ghost host and its timer; one ghost at a time (a new swap replaces it). */
  const ghost = useRef<Ghost | null>(null);

  const release = useCallback(() => {
    const g = ghost.current;
    if (!g || g.host.classList.contains(GHOST_FADE)) return;
    g.host.classList.add(GHOST_FADE);
    if (g.timer) clearTimeout(g.timer);
    g.timer = setTimeout(() => {
      g.host.remove();
      if (ghost.current === g) ghost.current = null;
    }, GHOST_MS);
  }, []);

  // Stable on purpose: a changing callback would re-run Screen's cleanup on a LIVE screen.
  const onLeave = useCallback(
    (snapshot: HTMLElement) => {
      const parent = wrap.current;
      if (reducedRef.current || !parent) return;
      if (ghost.current) {
        if (ghost.current.timer) clearTimeout(ghost.current.timer);
        ghost.current.host.remove();
      }
      const host = parent.ownerDocument.createElement('div');
      host.className = GHOST;
      host.setAttribute('aria-hidden', 'true');
      host.appendChild(snapshot);
      parent.appendChild(host);
      const g: Ghost = { host, timer: null };
      ghost.current = g;
      if (holdRef.current) g.timer = setTimeout(release, HOLD_MAX_MS);
      else release();
    },
    [release],
  );
  // A held ghost releases when `hold` drops.
  useEffect(() => {
    if (!hold) release();
  }, [hold, release]);
  useEffect(
    () => () => {
      const g = ghost.current;
      if (g?.timer) clearTimeout(g.timer);
      g?.host.remove();
    },
    [],
  );
  return (
    <div ref={wrap} className={styles.wrap}>
      <Screen key={swapKey} className={className} onLeave={onLeave}>
        {children}
      </Screen>
    </div>
  );
}
