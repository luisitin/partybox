// I-792 E (design review): every lobby tip in ONE line under the roster, rotating every 5 s. The
// lines share one grid cell, so the row is as tall as the longest and never moves the screen under
// a finger when the text changes; the one on show crossfades in (opacity only).
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { t } from '../i18n';
import styles from './Lobby.module.css';

export interface LobbyLineItem {
  id: string;
  text: string;
  /** I-082 A: a VIP tip — the ✕ beside it retires the tips for good. */
  tip?: boolean;
}

export function LobbyLine({
  lines,
  onDismissTips,
}: {
  lines: readonly LobbyLineItem[];
  onDismissTips?: () => void;
}): JSX.Element | null {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (lines.length < 2) return undefined;
    const h = setInterval(() => setTick((i) => i + 1), 5000);
    return () => clearInterval(h);
  }, [lines.length]);
  if (lines.length === 0) return null;
  const on = tick % lines.length;
  const showClose = onDismissTips !== undefined && lines.some((l) => l.tip);
  return (
    <div className={styles.line}>
      <span aria-hidden className={styles.lineIcon}>
        💡
      </span>
      <span className={styles.lineStack} role="status">
        {lines.map((l, i) => (
          <span
            key={l.id}
            className={`${styles.lineText} ${i === on ? styles.lineOn : ''}`}
            aria-hidden={i !== on}
          >
            {l.text}
          </span>
        ))}
      </span>
      {showClose ? (
        <button
          type="button"
          className={styles.tipClose}
          aria-label={t.lobby.dismissTips}
          onClick={onDismissTips}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
