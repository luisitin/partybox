// ADR-053: the start stage's 3·2·1 on the TV and every phone, each number derived from the same
// server timestamp (`countdownAt`), so they land on the same frame everywhere. Before it (the
// breath after the last READY) nothing new shows. Each number rises in over the dimmed rules
// (reduced motion: it only changes) and calls `onNumber` once, for its cue.
import { useEffect, useRef } from 'react';
import type { JSX, ReactNode } from 'react';
import { useServerNow } from '@partybox/game-sdk/ui';
import styles from './StageCount.module.css';

/** The number showing at server time `now` (3, 2, 1), or null before the count. Past the "1" it
 *  stays on 1 (its fade settled, the dim held) until the game replaces the stage: the host's tick
 *  lands a beat after 3 s, and dropping the overlay then showed the undimmed rules for ~250 ms
 *  (Session C, all five games). */
export function countAt(countdownAt: number | null, now: number): number | null {
  if (countdownAt === null || now < countdownAt) return null;
  return Math.max(1, 3 - Math.floor((now - countdownAt) / 1000));
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
  // the "1" has faded by 2.9 s (its rise lasts 900 ms); marking it a little early keeps a clock a few
  // ms behind the server's tick from snapshotting it bright
  const past = at !== null && now >= at + 2850;
  const said = useRef<number | null>(null);
  useEffect(() => {
    if (n === null || said.current === n) return;
    said.current = n;
    onNumber?.(n);
  }, [n, onNumber]);
  if (n === null) return null;
  return (
    <div className={`${styles.count} ${styles[surface]}`} role="timer" aria-live="assertive">
      {/* past the count the "1" is faded for good, as a class, not only as an animation's end:
          the game's curtain snapshots the stage with animations off and showed it bright again */}
      <span key={n} className={`${styles.number} ${past ? styles.past : ''}`}>
        {n}
      </span>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
