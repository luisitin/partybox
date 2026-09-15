// "Nothing to do right now" state for phones: submitted, spectating, or waiting for others.
// Calm by design — the TV is where the action is.
import type { JSX, ReactNode } from 'react';
import { Screen } from './Screen';
import styles from './WaitingScreen.module.css';

export interface WaitingScreenProps {
  title: string;
  hint?: ReactNode;
  /** 'done' shows a big ✓ (you submitted), 'watch' an eye (spectator), 'wait' dots. */
  mood?: 'done' | 'watch' | 'wait';
  children?: ReactNode;
}

const GLYPH = { done: '✓', watch: '◎', wait: '…' } as const;

export function WaitingScreen({
  title,
  hint,
  mood = 'wait',
  children,
}: WaitingScreenProps): JSX.Element {
  return (
    <Screen>
      <div className={styles.center} role="status" aria-live="polite">
        <span className={`${styles.glyph} ${styles[mood]}`} aria-hidden>
          {GLYPH[mood]}
        </span>
        <h2 className={styles.title}>{title}</h2>
        {hint ? <p className={styles.hint}>{hint}</p> : null}
        {children}
      </div>
    </Screen>
  );
}
