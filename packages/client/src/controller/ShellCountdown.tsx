// The phone's countdown row during play (the TV timer is 3 m away), split from ControllerShell (its
// line cap). ADR-030: a quiet timer keeps the bar (a rhythm) but drops the digits and the urgency;
// offline it is shown muted, never urgent, and "Reconnecting…" takes its cue slot. I-794 H: a game
// screen's own short line (whose book, which round) sits left of the bar; a cue hides it in place.
import type { JSX } from 'react';
import { DeadlineBar, useShellTimerLabel } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import type { ControllerState } from '../net/controller';
import styles from './ControllerShell.module.css';

export function ShellCountdown({
  view,
  seconds,
  online,
  banner,
  hurry,
}: {
  view: NonNullable<ControllerState['view']>;
  seconds: number;
  online: boolean;
  /** The link's banner text, when it shows (it takes the cue slot). */
  banner: string | null;
  /** The phone's urgency cue ("Hurry!"). */
  hurry: boolean;
}): JSX.Element {
  const label = useShellTimerLabel();
  return (
    <div
      className={`${styles.deadline} ${online && seconds <= 5 && !view.paused && view.timerMode !== 'quiet' ? styles.urgent : ''} ${online ? '' : styles.stale}`}
      role="timer"
      aria-label={view.paused ? t.tv.paused : t.connection.secondsLeft(seconds)}
    >
      {label !== null ? (
        <span
          className={`${styles.timerLabel} ${banner !== null || hurry ? styles.timerLabelHidden : ''}`}
        >
          <span className={styles.timerLabelText}>{label.text}</span>
          {label.tail !== undefined ? <span>{` · ${label.tail}`}</span> : null}
        </span>
      ) : null}
      <DeadlineBar
        className={styles.bar}
        deadline={view.deadline}
        phaseKey={view.phaseId}
        paused={view.paused}
        urgentAt={online ? 5 : 0}
      />
      {banner !== null ? (
        <span className={`${styles.cue} ${styles.cueStale}`} role="status">
          {banner}
        </span>
      ) : hurry ? (
        <span className={styles.cue} aria-hidden>
          {t.connection.hurry}
        </span>
      ) : null}
      {view.timerMode !== 'quiet' || view.paused ? (
        <span className={styles.seconds}>
          {view.paused ? `⏸ ${t.tv.paused}` : online ? t.connection.seconds(seconds) : '—'}
        </span>
      ) : null}
    </div>
  );
}
