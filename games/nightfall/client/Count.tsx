// The 3 · 2 · 1 before the first night (owner, #decisions cc45f4): a gold ring drains over three
// seconds while each digit pops in with a tick. `until` is the roles phase's deadline; the first
// 600 ms (the breath after the last Ready) show the line alone.
import { useEffect } from 'react';
import type { JSX } from 'react';
import { useSecondsLeft, useSound } from '@partybox/game-sdk/ui';
import styles from './Count.module.css';

export function Count({
  until,
  line,
  size,
}: {
  until: number;
  line: string;
  size: 'tv' | 'phone';
}): JSX.Element {
  const left = useSecondsLeft(until, false, 50);
  const play = useSound();
  const shown = left === null ? 0 : Math.min(3, left);
  const counting = left !== null && left <= 3 && left > 0;
  useEffect(() => {
    if (counting) play('tick');
  }, [counting, shown, play]);
  return (
    <div
      className={`${styles.count} ${size === 'tv' ? styles.tv : ''}`}
      role="status"
      aria-live="assertive"
    >
      <div className={styles.wrap}>
        <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden="true">
          <circle className={styles.track} cx="60" cy="60" r="52" />
          {counting ? <circle key={until} className={styles.fill} cx="60" cy="60" r="52" /> : null}
        </svg>
        <span key={shown} className={styles.digit}>
          {counting ? shown : '🌙'}
        </span>
      </div>
      <p className={styles.line}>{line}</p>
    </div>
  );
}
