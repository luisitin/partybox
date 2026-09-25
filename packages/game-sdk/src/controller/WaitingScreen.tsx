// "Nothing to do right now" state for phones: submitted, spectating, or waiting for others.
// Calm by design — the TV is where the action is.
import type { JSX, ReactNode } from 'react';
import { Screen } from './Screen';
import styles from './WaitingScreen.module.css';

export interface WaitingScreenProps {
  title: string;
  hint?: ReactNode;
  /** 'done' shows a big ✓ (you submitted), 'watch' an eye (spectator), 'wait' dots, 'oops' a
   *  still ! (something needs a tap: a game that did not download). */
  mood?: 'done' | 'watch' | 'wait' | 'oops';
  children?: ReactNode;
  /** Forwarded to the Screen frame (e.g. `pb-enter` so the screen rises in as a new card). */
  className?: string;
}

const GLYPH = { done: '✓', watch: '◎', wait: '…', oops: '!' } as const;

export function WaitingScreen({
  title,
  hint,
  mood = 'wait',
  children,
  className,
}: WaitingScreenProps): JSX.Element {
  return (
    <Screen className={className}>
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
