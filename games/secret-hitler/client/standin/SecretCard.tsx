// STAND-IN for the SDK's SecretCard (Part 00 §6 P6; Imposter owns it, on game/imposter, not on
// main yet). Same props subset, so the swap is an import change: press and hold to see the face,
// let go to hide it. Plain on purpose (M1); the 3D flip comes with the real one.
import { useState } from 'react';
import type { JSX, ReactNode } from 'react';
import styles from './standin.module.css';

export interface SecretCardProps {
  children: ReactNode;
  /** The back's line; the same for every role. */
  backLabel: string;
  /** Accessible name of the control (translated by the caller). */
  label: string;
  className?: string;
}

export function SecretCard({
  children,
  backLabel,
  label,
  className,
}: SecretCardProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const show = (): void => setOpen(true);
  const hide = (): void => setOpen(false);
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={open}
      className={`${styles.secret} ${className ?? ''}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        show();
      }}
      onPointerUp={hide}
      onPointerCancel={hide}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter' ? show() : undefined)}
      onKeyUp={hide}
      onBlur={hide}
    >
      {open ? (
        <span className={styles.face}>{children}</span>
      ) : (
        <span className={styles.back}>{backLabel}</span>
      )}
    </button>
  );
}
