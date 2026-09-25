// The 3 · 2 · 1 before turn 1 (the owner's pacing rule [cc45f4]), on the TV and every phone from
// the same `startAt`: "Here we go!" for the breath after the last I'm ready, then 3, 2, 1, each
// digit popping in on its own second. The TV ticks each digit.
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { useServerNow, useSound, useT } from '@partybox/game-sdk/ui';
import { COUNTDOWN_MS } from '../server/timing';
import { STRINGS } from './strings';
import styles from './countdown.module.css';

export function Countdown({
  startAt,
  paused = false,
  size,
  tick = false,
}: {
  startAt: number;
  paused?: boolean;
  size: 'tv' | 'phone';
  /** The TV plays the tick; phones stay quiet (the room would echo). */
  tick?: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const now = useServerNow(paused ? 60_000 : 100);
  const left = Math.ceil((startAt - now) / 1000);
  const digit = left >= 1 && left <= COUNTDOWN_MS / 1000 ? left : null;
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!tick || digit === null || last.current === digit) return;
    last.current = digit;
    play('countdown', { quiet: true });
  }, [digit, tick, play]);
  return (
    <div className={`${styles.count} ${styles[size]}`} role="timer" aria-live="assertive">
      {digit === null ? (
        <span key="go" className={styles.go}>
          {L('Here we go!')}
        </span>
      ) : (
        <span key={digit} className={styles.digit}>
          {digit}
        </span>
      )}
    </div>
  );
}
