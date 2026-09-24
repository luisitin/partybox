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
  // I-788 B: the row stays while the body can scroll at all — "back to top" at the end
  const [scrolls, setScrolls] = useState(false);
  // I-456 A (the arrow clears the footer, however tall) is carried by I-187's zero-height anchor
  // between the body and the footer: the pill sits var(--pb-space-2) above the footer's top edge,
  // so a measured footer height would count it twice.
  useEffect(() => {
    const el = body.current;
    if (!el) return undefined;
    const check = (): void => {
      setMore(el.scrollHeight - el.clientHeight - el.scrollTop > 24);
      setScrolls(el.scrollHeight - el.clientHeight > 24);
    };
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
      {/* I-788 A: the cue has a row of its own between the body and the footer — it never covers
          content (it floated over the body's last line); B: it stays while the body scrolls at all */}
      {scrolls ? (
        <button
          type="button"
          className={styles.moreRow}
          aria-label={more ? L('scroll down') : L('back to top')}
          onClick={() =>
            more
              ? body.current?.scrollBy({ top: body.current.clientHeight * 0.8, behavior: 'smooth' })
              : body.current?.scrollTo({ top: 0, behavior: 'smooth' })
          }
        >
          <span aria-hidden>{more ? '▾' : '▴'}</span> {more ? L('more below') : L('back to top')}
        </button>
      ) : null}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}
