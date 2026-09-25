// The 3 · 2 · 1 before question 1 (owner, [cc45f4]). TV and phones count from the server's
// `goAt`, polled finely so the digits flip together; each digit pops in and ticks once.
import type { JSX } from 'react';
import { useSecondsLeft, useT } from '@partybox/game-sdk/ui';
import { useCueOnce } from './beats';
import { STRINGS } from './strings';
import styles from './fakeout.module.css';

export function Countdown({ goAt, big }: { goAt: number; big?: boolean }): JSX.Element {
  const L = useT(STRINGS);
  const left = useSecondsLeft(goAt, false, 50) ?? 0;
  const digit = left >= 1 && left <= 3 ? left : null;
  useCueOnce(digit === null ? null : 'countdown', digit === null ? null : `c${goAt}-${digit}`);
  return (
    <div className={`${styles.countdown} ${big ? styles.countdownBig : ''}`} aria-live="polite">
      <p className={styles.countdownLabel}>{L('Everyone is ready!')}</p>
      <span key={digit ?? 'go'} className={styles.countdownDigit}>
        {digit ?? '🎭'}
      </span>
    </div>
  );
}
