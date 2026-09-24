// Local stand-in for Part 00 §6's `SecretCard` (Imposter owns the SDK one; NOTES: stand-ins). A card
// back ("Hold to see your role"); press and hold flips it in 3D (`pb-flip`-style, transform only);
// release flips it back. Hardened against the ways phones fight a long press: no text selection,
// no iOS callout, no context menu, no scroll or zoom starting on it, and a drag off the card lets go.
// `strip` is the one-line version (night job, night report). Reduced motion: a crossfade.
import { useEffect, useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { buzz } from '@partybox/game-sdk/ui';
import styles from './HoldCard.module.css';

export interface HoldCardProps {
  /** The card back's words ("Hold to see your role"). */
  back: ReactNode;
  /** What holding reveals. */
  children: ReactNode;
  /** One line instead of a full card. */
  strip?: boolean;
  className?: string;
  /** Accessible name of the control. */
  label: string;
}

export function HoldCard({ back, children, strip, className, label }: HoldCardProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const pointer = useRef<number | null>(null);
  // A lost pointer (the page hidden, the phone locked) must never leave the secret showing.
  useEffect(() => {
    if (!open) return undefined;
    const close = (): void => setOpen(false);
    document.addEventListener('visibilitychange', close);
    window.addEventListener('blur', close);
    return () => {
      document.removeEventListener('visibilitychange', close);
      window.removeEventListener('blur', close);
    };
  }, [open]);
  const release = (): void => {
    pointer.current = null;
    setOpen(false);
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={open}
      className={`${styles.card} ${strip ? styles.strip : ''} ${open ? styles.open : ''} ${className ?? ''}`}
      onPointerDown={(e) => {
        if (pointer.current !== null) return;
        pointer.current = e.pointerId;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setOpen(true);
        buzz(10);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setOpen(true);
        }
      }}
      onKeyUp={() => setOpen(false)}
      onBlur={() => setOpen(false)}
    >
      <div className={styles.flipper}>
        <div className={`${styles.face} ${styles.back}`} aria-hidden={open}>
          <span className={styles.glyph} aria-hidden="true">
            ✋
          </span>
          <span className={styles.backText}>{back}</span>
        </div>
        <div className={`${styles.face} ${styles.front}`} aria-hidden={!open}>
          {children}
        </div>
      </div>
    </div>
  );
}
