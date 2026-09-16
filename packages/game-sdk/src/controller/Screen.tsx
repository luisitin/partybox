// Phone screen frame: safe-area padding, no rubber-banding, and a sticky bottom bar so the primary
// action stays thumb-reachable and is never hidden by the iOS keyboard.
//
// Screens dissolve into each other (review-loop #18): a Screen that really unmounts parks a DOM
// snapshot of itself in its parent and fades it over --pb-motion-base, so whatever mounts next —
// even a frame later — rises under the old picture instead of after a blank. Imperative on purpose
// (no state, no extra render) so the ghost is there from the first frame; StrictMode's simulated
// unmount leaves the node connected and is ignored. Reduced motion: no ghost.
import { useLayoutEffect, useRef } from 'react';
import type { JSX, ReactNode } from 'react';
import { sanitizeSnapshot, usePrefersReducedMotion } from '../ui/motion';
import styles from './Screen.module.css';

export interface ScreenProps {
  children: ReactNode;
  /** Rendered in the sticky bottom bar (usually a PrimaryButton). */
  footer?: ReactNode;
  title?: ReactNode;
  className?: string;
}

const GHOST_MS = 350;
const GHOST = styles['ghost'] ?? 'ghost';

export function Screen({ children, footer, title, className }: ScreenProps): JSX.Element {
  const section = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  useLayoutEffect(() => {
    const el = section.current;
    if (!el || reduced) return;
    return () => {
      // Unmount: the parent keeps a fading picture of this screen for one motion beat.
      const parent = el.parentElement;
      const snapshot = sanitizeSnapshot(el.cloneNode(true) as HTMLElement);
      queueMicrotask(() => {
        if (el.isConnected || !parent?.isConnected) return; // StrictMode rehearsal, or gone
        const host = el.ownerDocument.createElement('div');
        host.className = GHOST;
        host.appendChild(snapshot);
        parent.appendChild(host);
        setTimeout(() => host.remove(), GHOST_MS);
      });
    };
  }, [reduced]);
  return (
    <section ref={section} className={`${styles.screen} ${className ?? ''}`}>
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}
