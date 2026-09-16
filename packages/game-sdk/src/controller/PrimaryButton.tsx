// The one big button: ≥ 56 px tall, full width, explicit disabled/busy/done states. A disabled
// button is `aria-disabled`, not DOM-disabled, so a tap on it still reaches us: it shakes once and
// buzzes 10 ms, pulling the eye to the reason the caller prints above it (Safari and Firefox fire
// no click on a disabled button, so the acknowledgement needs the attribute route).
import { useState } from 'react';
import type { ButtonHTMLAttributes, JSX } from 'react';
import { buzz } from '../ui/haptics';
import styles from './PrimaryButton.module.css';

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'accent' | 'neutral' | 'danger' | 'success';
  /** Shows a ✓ and disables (e.g. "Submitted"); a tap on it is silently inert. */
  done?: boolean;
}

export function PrimaryButton({
  tone = 'accent',
  done,
  className,
  children,
  disabled,
  onClick,
  onAnimationEnd,
  ...rest
}: PrimaryButtonProps): JSX.Element {
  const [shaking, setShaking] = useState(false);
  const inert = Boolean(disabled || done);
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[tone]} ${done ? styles.done : ''} ${shaking ? styles.shake : ''} ${className ?? ''}`}
      aria-disabled={inert}
      onClick={(e) => {
        if (!inert) {
          onClick?.(e);
          return;
        }
        // Stops a type="submit" from submitting (and from showing the native `required` bubble).
        e.preventDefault();
        if (done) return;
        setShaking(true);
        buzz(10);
      }}
      onAnimationEnd={(e) => {
        setShaking(false);
        onAnimationEnd?.(e);
      }}
      {...rest}
    >
      {done ? (
        <span className={styles.check} aria-hidden>
          ✓{' '}
        </span>
      ) : null}
      {children}
    </button>
  );
}
