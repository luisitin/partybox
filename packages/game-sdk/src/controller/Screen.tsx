// Phone screen frame: safe-area padding, no rubber-banding, and a sticky bottom bar so the primary
// action stays thumb-reachable and is never hidden by the iOS keyboard.
import type { JSX, ReactNode } from 'react';
import styles from './Screen.module.css';

export interface ScreenProps {
  children: ReactNode;
  /** Rendered in the sticky bottom bar (usually a PrimaryButton). */
  footer?: ReactNode;
  title?: ReactNode;
  className?: string;
}

export function Screen({ children, footer, title, className }: ScreenProps): JSX.Element {
  return (
    <section className={`${styles.screen} ${className ?? ''}`}>
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}
