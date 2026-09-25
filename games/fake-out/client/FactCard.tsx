// The fact with its blank (SPEC §3.4), drawn like Blanks' black card (owner, 2026-09-25: "match the
// style of Wisecrack and Blanks"): dark ink, light type, left-aligned; the blank is a paper line and
// the truth, once revealed, drops into it as a cream paper mark with charcoal ink, the same mark
// Blanks uses for a played white card. No read-along: the reader's voice is enough.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { FactView } from '../server/views-common';
import styles from './fakeout.module.css';
import { STRINGS } from './strings';

export interface FactCardProps {
  fact: FactView;
  /** `h1` on the question card, `h2` in lie / pick / reveal; `phone` on a phone. */
  size: 'h1' | 'h2' | 'phone';
  /** Show the truth in the blank (the completed fact). */
  filled?: boolean;
  className?: string;
}

export function FactCard({ fact, size, filled = false, className }: FactCardProps): JSX.Element {
  const L = useT(STRINGS);
  const truth = filled ? fact.truth : null;
  return (
    <p
      className={`${styles.fact} ${styles[`fact_${size}`] ?? ''} ${className ?? ''}`}
      data-filled={truth ? '' : undefined}
    >
      {fact.before}
      {truth ? (
        <mark className={styles.truthMark}>{truth.toUpperCase()}</mark>
      ) : (
        <span className={styles.blank} role="img" aria-label={L('blank')} />
      )}
      {fact.after}
    </p>
  );
}
