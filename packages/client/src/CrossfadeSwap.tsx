// Keyed screen swap without the blank frame (review-loop #1): when `swapKey` changes, a static
// DOM snapshot of the outgoing screen stays on top and fades out over `--pb-motion-base` while the
// incoming one rises as before. A snapshot (cloneNode taken as the old screen unmounts), not a second
// React subtree, so no effect or sound cue ever runs twice. The ghost is appended imperatively in
// the unmount's microtask — before the next paint — because a state update would land a frame
// later and leave one blank frame (review-loop #26). Reduced motion: no snapshot.
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { CSSProperties, JSX, ReactNode } from 'react';
import { sanitizeSnapshot, usePrefersReducedMotion } from '@partybox/game-sdk/ui';
import styles from './CrossfadeSwap.module.css';

export interface CrossfadeSwapProps {
  /** I-039 A: a game-sdk Screen mounting inside waits this long before its rise. */
  delayMs?: number;
  swapKey: string;
  /** Class for the live container (layout + the rise animation). Default: a flex column the
   *  phone Screen fills, so its sticky footer parks at the bottom (review-loop #31). */
  className?: string;
  /** Keep the outgoing snapshot fully opaque while true (the incoming screen has nothing to show
   *  yet); the fade starts when it turns false. Capped at HOLD_MAX_MS (review-loop #10). */
  hold?: boolean;
  /** The ghost fades over `--pb-motion-fast` (the incoming screen brings its own entrance). */
  quick?: boolean;
  /** I-120 A: the outgoing snapshot goes to black before it drops (a curtain, not a dissolve). */
  curtain?: boolean;
  children: ReactNode;
}

/** ~`--pb-motion-base` plus a frame of slack before the snapshot is dropped. */
const GHOST_MS = 350;
const HOLD_MAX_MS = 1500;
const GHOST = styles['ghost'] ?? 'ghost';
const GHOST_FADE = styles['ghostFade'] ?? 'ghostFade';
const GHOST_QUICK = styles['ghostQuick'] ?? 'ghostQuick';
const GHOST_CURTAIN = styles['ghostCurtain'] ?? 'ghostCurtain'; // I-120 A

/** The live screen; hands a clone of its DOM to the parent the moment it really unmounts. */
function Screen({
  className,
  onLeave,
  delayMs,
  children,
}: {
  className?: string;
  /** I-039 A: the next game-sdk Screen waits this long before rising (its ghost fades first). */
  delayMs?: number;
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
    <div
      ref={node}
      className={className}
      style={{ '--pb-screen-delay': `${delayMs ?? 0}ms` } as CSSProperties}
    >
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
  delayMs = 0,
  className = styles.live,
  hold = false,
  quick = false,
  curtain = false,
  children,
}: CrossfadeSwapProps): JSX.Element {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(reduced);
  const holdRef = useRef(hold);
  const quickRef = useRef(quick);
  const curtainRef = useRef(curtain);
  useEffect(() => {
    reducedRef.current = reduced;
    holdRef.current = hold;
    quickRef.current = quick;
    curtainRef.current = curtain;
  }, [reduced, hold, quick, curtain]);
  /** The current ghost host and its timer; one ghost at a time (a new swap replaces it). */
  const ghost = useRef<Ghost | null>(null);

  const release = useCallback(() => {
    const g = ghost.current;
    if (!g || g.host.classList.contains(GHOST_FADE)) return;
    g.host.classList.add(GHOST_FADE);
    if (g.timer) clearTimeout(g.timer);
    // I-120 A: a curtain takes two beats (dark, then gone).
    g.timer = setTimeout(
      () => {
        g.host.remove();
        if (ghost.current === g) ghost.current = null;
      },
      g.host.classList.contains(GHOST_CURTAIN) ? GHOST_MS * 2 : GHOST_MS,
    );
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
      host.className = quickRef.current
        ? `${GHOST} ${GHOST_QUICK}`
        : curtainRef.current
          ? `${GHOST} ${GHOST_CURTAIN}`
          : GHOST;
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
      <Screen key={swapKey} className={className} onLeave={onLeave} delayMs={delayMs}>
        {children}
      </Screen>
    </div>
  );
}
