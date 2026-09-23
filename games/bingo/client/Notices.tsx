// The Bingo phone's notices: the turn-your-phone gate and the reconnect toast (split out of
// Overlays.tsx at the 300-line cap when I-013 added the style diagrams).
import { useState } from 'react';
import type { JSX } from 'react';
import type { BingoControllerView, CallView } from '../server/views';
import { Ball } from './ControllerParts';
import type { Orientation } from './styles';
import styles from './Controller.module.css';

/** Wrong way up for the chosen style: a little phone turns the way it should go. */
export function TurnGate({ to, style }: { to: Orientation; style: string }): JSX.Element {
  return (
    <div className={styles.turn} role="status">
      <span
        className={`${styles.turnPhone} ${to === 'landscape' ? styles.turnToLandscape : styles.turnToPortrait}`}
        aria-hidden
      />
      <p className={styles.turnLine}>
        Turn your phone {to === 'landscape' ? 'sideways' : 'upright'} for {style}.
      </p>
      <p className={styles.hint}>the cards appear the moment you do</p>
    </div>
  );
}

/** The reconnect notice (review-loop #4): the TV board has what you missed — and with the board
 *  off, the notice names the calls (pass 866: `recent` carried them and the phone never showed
 *  them). `recent` is the last four calls, the current one last; more than three → "and n more". */
export function MissedToast({
  view,
  count,
  calls,
  onDismiss,
  onBall,
}: {
  view: BingoControllerView;
  count: number;
  /** I-122 A: the calls missed, frozen when the player came back (so the tray does not slide on to new calls). */
  calls: string[];
  /** I-122 A: the tray closes by hand. */
  onDismiss: () => void;
  /** I-122 B: a tapped ball — daub it if it is on the card that is up; either way it fades. */
  onBall?: (number: number) => boolean;
}): JSX.Element | null {
  // main's phone-only rule (2026-09-22) kept: no TV board to point at in a phone-only room
  const board = view.showBoard && !view.phoneOnly;

  const missed = calls;
  const [gone, setGone] = useState<number[]>([]);
  void setGone;
  if (missed.length === 0 && !board) return null;
  const more = count - missed.length;
  const balls = missed.map((s) => {
    const [letter, num] = s.split(' ');
    return { letter: (letter ?? 'B') as CallView['letter'], number: Number(num), call: s };
  });
  return (
    <div className={`${styles.missedToast} ${styles.missedTray}`} role="status">
      <span className={styles.missedLabel}>
        {board && balls.length === 0
          ? count === 1
            ? 'Back — you missed a number. It is on the TV board.'
            : `Back — you missed ${count} numbers. They are on the TV board.`
          : 'Back — you missed'}
      </span>
      {balls.map((b) =>
        gone.includes(b.number) ? null : (
          <button
            key={b.number}
            type="button"
            onClick={() => {
              onBall?.(b.number);
              setGone((g) => [...g, b.number]);
            }}
            aria-label={`missed ${b.letter} ${b.number} — tap to daub it`}
            className={`${styles.missedBall}`}
          >
            <Ball call={b} size="sm" />
          </button>
        ),
      )}
      {more > 0 ? <span className={styles.missedLabel}>+{more} more</span> : null}
      <button type="button" className={styles.missedClose} onClick={onDismiss} aria-label="dismiss">
        ✕
      </button>
    </div>
  );
}
