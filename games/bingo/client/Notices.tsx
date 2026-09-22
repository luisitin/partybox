// The Bingo phone's notices: the turn-your-phone gate and the reconnect toast (split out of
// Overlays.tsx at the 300-line cap when I-013 added the style diagrams).
import type { JSX } from 'react';
import type { BingoControllerView } from '../server/views';
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
}: {
  view: BingoControllerView;
  count: number;
}): JSX.Element | null {
  // A phone-only room has no TV board to point at: it lists what was missed, like a room without
  // the board (the owner, 2026-09-22).
  const board = view.showBoard && !view.phoneOnly;
  const missed = board ? [] : view.recent.slice(0, -1).slice(-count);
  if (!board && missed.length === 0) return null;
  const more = count - missed.length;
  return (
    <p className={styles.missedToast} role="status">
      {board
        ? count === 1
          ? 'Back — you missed a number. It is on the TV board.'
          : `Back — you missed ${count} numbers. They are on the TV board.`
        : `Back — you missed ${missed.join(', ')}${more > 0 ? ` and ${more} more` : ''}.`}
    </p>
  );
}
