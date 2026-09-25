// Hold to see (a stand-in for Imposter's SecretCard until it ships, P00 §6): the card shows its
// back until pressed; pressing and holding turns it face-up in 3D, letting go turns it back, and a
// scroll that steals the finger turns it back too. Neighbours can't peek over a shoulder. Space or
// Enter toggles it for a keyboard. No text selection, no callout, no context menu.
import { useState } from 'react';
import type { JSX, ReactNode } from 'react';
import styles from './phone.module.css';

export function HoldToSee({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const hide = (): void => setOpen(false);
  return (
    <button
      type="button"
      className={`${styles.hold} ${open ? styles.holdOpen : ''}`}
      aria-pressed={open}
      aria-label={label}
      onPointerDown={(e) => {
        if (!e.isPrimary) return;
        setOpen(true);
      }}
      onPointerUp={hide}
      onPointerCancel={hide}
      onPointerLeave={hide}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();
        setOpen((o) => !o);
      }}
      onBlur={hide}
    >
      <span className={styles.holdInner}>
        <span className={styles.holdBack} aria-hidden={open}>
          <span className={styles.holdGlyph}>🔒</span>
          {label}
        </span>
        <span className={styles.holdFront} aria-hidden={!open}>
          {children}
        </span>
      </span>
    </button>
  );
}
