// Phone screen frame: safe-area padding, no rubber-banding, and a sticky bottom bar so the primary
// action stays thumb-reachable and is never hidden by the iOS keyboard.
//
// Screens dissolve into each other (review-loop #18): a Screen that really unmounts parks a DOM
// snapshot of itself in its parent and fades it over --pb-motion-base, so whatever mounts next —
// even a frame later — rises under the old picture instead of after a blank. Imperative on purpose
// (no state, no extra render) so the ghost is there from the first frame; StrictMode's simulated
// unmount leaves the node connected and is ignored. Reduced motion: no ghost.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { useT } from '../ui/lang';
import { sanitizeSnapshot, usePrefersReducedMotion } from '../ui/motion';
import styles from './Screen.module.css';
import { STRINGS } from './strings';

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
  const L = useT(STRINGS);
  const section = useRef<HTMLElement>(null);
  // I-066 B: "more below" — true while the body can scroll further (scroll + resize watched).
  const body = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  // I-456 A: the footer's real height, so the arrow sits just above it (a 60 px guess put it over
  // the text of any taller footer — the VIP's results, a two-line button)
  const foot = useRef<HTMLDivElement>(null);
  const [footH, setFootH] = useState(0);
  const hasFooter = Boolean(footer); // the footer div renders exactly when this is true
  useEffect(() => {
    const el = foot.current;
    if (!el) return undefined;
    const measure = (): void => setFootH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasFooter]);
  useEffect(() => {
    const el = body.current;
    if (!el) return undefined;
    const check = (): void => setMore(el.scrollHeight - el.clientHeight - el.scrollTop > 24);
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, []);
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
      <div ref={body} className={styles.body}>
        {children}
      </div>
      {more ? (
        <button
          type="button"
          className={styles.more}
          style={footH ? { bottom: `calc(${footH}px + var(--pb-space-2))` } : undefined}
          aria-label={L('scroll down')}
          onClick={() =>
            body.current?.scrollBy({ top: body.current.clientHeight * 0.8, behavior: 'smooth' })
          }
        >
          ▾
        </button>
      ) : null}
      {footer ? (
        <div ref={foot} className={styles.footer}>
          {footer}
        </div>
      ) : null}
    </section>
  );
}
