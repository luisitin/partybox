// The stage timer: huge digits, turns red and scales in the last 5 seconds, ticks via `onTick`
// (the TV shell maps that to the `countdown` sound cue). Shows ⏸ while paused.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { useSecondsLeft } from '../ui/clock';
import styles from './Timer.module.css';

export interface TimerProps {
  deadline: number | null;
  paused?: boolean;
  /** Fires once per second during the last 5 seconds. */
  onTick?: (secondsLeft: number) => void;
  size?: 'md' | 'lg';
}

export function Timer({
  deadline,
  paused = false,
  onTick,
  size = 'lg',
}: TimerProps): JSX.Element | null {
  const seconds = useSecondsLeft(deadline, paused);
  // Short phases (a 5 s reveal, ten times a game) never go red: urgency is for phases of 15 s or
  // more, judged by how much was left when this deadline was first seen (review-loop #24; same
  // rule as DeadlineBar). "Adjust state when a prop changes".
  const [seen, setSeen] = useState<{ deadline: number | null; seconds: number | null }>({
    deadline,
    seconds,
  });
  if (seen.deadline !== deadline) setSeen({ deadline, seconds });
  const longPhase = (seen.seconds ?? 0) >= 15;
  const lastTicked = useRef<number | null>(null);
  useEffect(() => {
    if (seconds === null || paused || seconds > 5 || seconds === 0 || !longPhase) return;
    if (lastTicked.current === seconds) return;
    lastTicked.current = seconds;
    onTick?.(seconds);
  }, [seconds, paused, onTick, longPhase]);
  if (seconds === null) return null;
  const urgent = !paused && seconds <= 5 && longPhase;
  return (
    <div
      className={`${styles.timer} ${styles[size]} ${urgent ? styles.urgent : ''} ${paused ? styles.paused : ''}`}
      role="timer"
      aria-live={urgent ? 'assertive' : 'off'}
      aria-label={paused ? 'paused' : `${seconds} seconds left`}
    >
      {paused ? <span className={styles.pauseGlyph}>⏸</span> : null}
      <span className={styles.digits}>{seconds}</span>
    </div>
  );
}
