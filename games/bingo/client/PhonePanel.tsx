// S-003 A: Bingo's phone settings for the lobby's 🎨 sheet — the card style and Motion, the
// same stores the in-game sheet writes (per phone), so a choice made while waiting is the choice
// in the round.
import type { JSX } from 'react';
import { setMotionOff, useMotionOff } from '@partybox/game-sdk/ui';
import { STYLES, setCardStyle, useCardStyle } from './styles';
import styles from './Controller.module.css';

export function PhonePanel(): JSX.Element {
  const current = useCardStyle(4); // every style fits four cards: the full list is offered
  const motionOff = useMotionOff();
  return (
    <div className={styles.lobbyPanel}>
      {STYLES.map((s) => (
        <button
          type="button"
          key={s.id}
          className={`${styles.row} ${s.id === current ? styles.rowOn : ''}`}
          onClick={() => setCardStyle(s.id)}
        >
          <span className={styles.rowText}>
            {s.label} <small className={styles.rowHint}>· {s.hint}</small>
          </span>
          <small>{s.id === current ? '✓' : ''}</small>
        </button>
      ))}
      <button
        type="button"
        className={`${styles.row} ${motionOff ? '' : styles.rowOn}`}
        onClick={() => setMotionOff(!motionOff)}
        aria-pressed={!motionOff}
      >
        <span className={styles.rowText}>
          Motion <small className={styles.rowHint}>· cards rise, numbers pop</small>
        </span>
        <small>{motionOff ? 'off' : 'on ✓'}</small>
      </button>
    </div>
  );
}
