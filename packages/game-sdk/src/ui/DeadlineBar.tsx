// A thin bar that drains towards the deadline (TV strip and phone header). Transform-only so it stays
// cheap; turns danger-coloured in the last 5 seconds. The phase start is not in the view envelope, so
// it is taken from the moment this bar first sees a given `phaseKey` + `deadline` (a late joiner sees
// the bar start full from then — acceptable, and exact once `phaseStartedAt` exists on the wire).
// The track is keyed on that phase instance so a new phase mounts a fresh full bar instead of
// tweening the old fill back to full width (and its colour through orange) — R-069.
import { useState } from 'react';
import type { JSX } from 'react';
import { useSecondsLeft, useServerNow } from './clock';
import styles from './DeadlineBar.module.css';

export interface DeadlineBarProps {
  deadline: number | null;
  /** Changes whenever a new phase instance starts (e.g. `phaseId`). */
  phaseKey: string;
  paused?: boolean;
  /** Seconds left at which the bar switches to the danger colour (default 5). */
  urgentAt?: number;
  className?: string;
}

export function DeadlineBar({
  deadline,
  phaseKey,
  paused = false,
  urgentAt = 5,
  className,
}: DeadlineBarProps): JSX.Element | null {
  const now = useServerNow(paused ? 60_000 : 250);
  const seconds = useSecondsLeft(deadline, paused);
  const key = `${phaseKey}:${deadline ?? ''}`;
  // "Adjust state when a prop changes" pattern: remember when this phase instance was first seen.
  const [start, setStart] = useState({ key, at: now });
  if (start.key !== key) setStart({ key, at: now });
  if (deadline === null || seconds === null) return null;
  const total = Math.max(1, deadline - (start.key === key ? start.at : now));
  const fraction = Math.min(1, Math.max(0, (deadline - now) / total));
  const urgent = !paused && seconds <= urgentAt && seconds > 0;
  return (
    <div
      key={key}
      className={`${styles.track} ${urgent ? styles.urgent : ''} ${paused ? styles.paused : ''} ${className ?? ''}`}
      aria-hidden
    >
      <div className={styles.fill} style={{ transform: `scaleX(${fraction})` }} />
    </div>
  );
}
