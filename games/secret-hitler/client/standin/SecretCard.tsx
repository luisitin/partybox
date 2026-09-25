// STAND-IN for the SDK's SecretCard (Part 00 §6 P6; Imposter owns it, on game/imposter, not on
// main yet). Same props subset, so the swap is an import change. Hold mode: press and hold to see
// the face, let go to hide it. Tap mode (the phone's preference): tap to show, tap again or wait
// 5 s to hide. It also turns back on pointercancel, blur and the page hiding. Plain on purpose
// (M1); the 3D turn comes with the real one.
import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { AUTO_HIDE_MS, getSecretCardMode } from './mode';
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
  const [tap] = useState(() => getSecretCardMode() === 'tap');
  const show = (): void => setOpen(true);
  const hide = (): void => setOpen(false);
  useEffect(() => {
    const onHide = (): void => {
      if (document.visibilityState === 'hidden') setOpen(false);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);
  useEffect(() => {
    if (!open || !tap) return;
    const t = setTimeout(() => setOpen(false), AUTO_HIDE_MS);
    return () => clearTimeout(t);
  }, [open, tap]);
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={open}
      className={`${styles.secret} ${className ?? ''}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        if (tap) return setOpen(!open);
        e.currentTarget.setPointerCapture(e.pointerId);
        show();
      }}
      onPointerUp={() => (tap ? undefined : hide())}
      onPointerCancel={hide}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();
        if (e.repeat) return;
        if (tap) setOpen(!open);
        else show();
      }}
      onKeyUp={() => (tap ? undefined : hide())}
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
