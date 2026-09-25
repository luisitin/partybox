// ADR-053: the start stage's 3·2·1 on the TV and every phone, each number derived from the same
// server timestamp (`countdownAt`), so they land on the same frame everywhere. Before it (the
// breath after the last READY) nothing new shows. Each number rises in over the dimmed rules
// (reduced motion: it only changes) and calls `onNumber` once, for its cue.
import { useEffect, useRef } from 'react';
import type { JSX, ReactNode } from 'react';
import { useServerNow } from '@partybox/game-sdk/ui';
import styles from './StageCount.module.css';

/** The number showing at server time `now` (3, 2, 1), or null outside the count. */
export function countAt(countdownAt: number | null, now: number): number | null {
  if (countdownAt === null || now < countdownAt) return null;
  const n = 3 - Math.floor((now - countdownAt) / 1000);
  return n >= 1 ? n : null;
}

export function StageCount({
  at,
  onNumber,
  surface,
  action,
}: {
  at: number | null;
  onNumber?: (n: number) => void;
  surface: 'tv' | 'phone';
  /** The VIP's Wait, above the dim (the only thing to tap during the count). */
  action?: ReactNode;
}): JSX.Element | null {
  const now = useServerNow(40);
  const n = countAt(at, now);
  const said = useRef<number | null>(null);
  useEffect(() => {
    if (n === null || said.current === n) return;
    said.current = n;
    onNumber?.(n);
  }, [n, onNumber]);
  if (n === null) return null;
  return (
    <div className={`${styles.count} ${styles[surface]}`} role="timer" aria-live="assertive">
      <span key={n} className={styles.number}>
        {n}
      </span>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
