// The 3 · 2 · 1 after the ready-up (the owner's pacing rule, 2026-09-24), on the TV and every
// phone from the same `startAt`: the room dims, a brass ring drains, and each digit is stamped in
// with a tick. The first 600 ms are a breath with the line alone.
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { useSecondsLeft, useServerNow, useSound, useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';
import styles from './countdown.module.css';

/** The count's whole length (server/types.ts COUNTDOWN_MS; the client never imports the server). */
const COUNT_MS = 3_600;

export function Countdown({
  until,
  paused,
  size,
}: {
  until: number;
  paused: boolean;
  size: 'tv' | 'phone';
}): JSX.Element | null {
  const L = useT(STRINGS);
  const left = useSecondsLeft(until, paused, 50);
  const play = useSound();
  const now = useServerNow(1_000);
  // A phone that arrives mid-count starts the ring where the room's is, not full.
  const [drainFrom] = useState(() => -Math.max(0, Math.min(COUNT_MS, COUNT_MS - (until - now))));
  const shown = left === null || left > 3 ? 0 : left;
  useEffect(() => {
    if (shown > 0) play('tick');
  }, [shown, play]);
  if (left === null || left <= 0) return null;
  return (
    <div className={styles.countdown} data-size={size} role="status" aria-live="assertive">
      <div className={styles.dial}>
        <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden="true">
          <circle className={styles.track} cx="60" cy="60" r="52" />
          <circle
            key={until}
            className={styles.fill}
            cx="60"
            cy="60"
            r="52"
            style={{ '--drain-from': `${drainFrom}ms` } as CSSProperties}
          />
        </svg>
        {shown > 0 ? (
          <span key={shown} className={styles.digit}>
            {shown}
          </span>
        ) : null}
      </div>
      <p className={styles.line}>{L('The session opens')}</p>
    </div>
  );
}
