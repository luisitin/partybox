// The one big button: ≥ 56 px tall, full width, explicit disabled/busy/done states.
import type { ButtonHTMLAttributes, JSX } from 'react';
import styles from './PrimaryButton.module.css';

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'accent' | 'neutral' | 'danger' | 'success';
  /** Shows a ✓ and disables (e.g. "Submitted"). */
  done?: boolean;
}

export function PrimaryButton({
  tone = 'accent',
  done,
  className,
  children,
  disabled,
  ...rest
}: PrimaryButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[tone]} ${done ? styles.done : ''} ${className ?? ''}`}
      disabled={disabled || done}
      aria-disabled={disabled || done}
      {...rest}
    >
      {done ? <span aria-hidden>✓ </span> : null}
      {children}
    </button>
  );
}
