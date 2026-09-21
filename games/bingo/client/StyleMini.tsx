// I-013: a card style as a shape — little card rectangles laid out the way the style lays them
// (Focus: one big + three thumbnails; Grid: 2 × 2; Stack: two upright; Side by side: two
// sideways; Strip: three sideways; Motion: two cards, one lifted). The style sheet's rows carry
// one each (A), the live one breathes (B) and the preview bar shows the pick at 1.5 × (C).
import type { JSX } from 'react';
import styles from './Controller.module.css';

export function StyleMini({
  id,
  off = false,
  big = false,
  live = false,
}: {
  id: string;
  /** A greyed row (the style needs another card count): outlined only. */
  off?: boolean;
  /** The preview bar's 1.5 × copy, popping in. */
  big?: boolean;
  /** I-013 B: the diagram of the style that is on breathes. */
  live?: boolean;
}): JSX.Element {
  const n = id === 'focus' ? 4 : id === 'grid' ? 4 : id === 'strip' ? 3 : 2;
  return (
    <span
      className={`${styles.mini} ${off ? styles.miniOff : ''} ${big ? styles.miniBig : ''} ${live ? styles.miniLive : ''}`}
      data-style={id}
      aria-hidden
    >
      {Array.from({ length: n }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
}
