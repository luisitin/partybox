// The fact with its blank (SPEC §3.4): the blank is a rounded box about four characters wide —
// never a row of underscores — that fills with the truth in the highlight colour at the
// completed-fact step (the box widens and the word pops in; transform + opacity only). With
// `read`, the words light up with the reader (ReadAlong).
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { FactView, ReadAlongView } from '../server/views-common';
import styles from './fakeout.module.css';
import { ReadAlong } from './ReadAlong';
import { STRINGS } from './strings';

export interface FactCardProps {
  fact: FactView;
  /** `h1` on the question card, `h2` in lie / pick / reveal; `phone` on a phone. */
  size: 'h1' | 'h2' | 'phone';
  /** Show the truth in the blank (the completed fact). */
  filled?: boolean;
  /** Light the words up with the reader. */
  read?: ReadAlongView;
  className?: string;
}

export function FactCard({
  fact,
  size,
  filled = false,
  read,
  className,
}: FactCardProps): JSX.Element {
  const L = useT(STRINGS);
  const truth = filled ? fact.truth : null;
  const blank = (
    <span
      className={truth ? styles.blankFilled : styles.blank}
      aria-label={truth ? undefined : L('blank')}
      role={truth ? undefined : 'img'}
    >
      {truth ? <span className={styles.truthWord}>{truth.toUpperCase()}</span> : null}
    </span>
  );
  return (
    <p
      className={`${styles.fact} ${styles[`fact_${size}`] ?? ''} ${className ?? ''}`}
      data-filled={truth ? '' : undefined}
    >
      <ReadAlong
        read={read}
        pieces={[
          { text: fact.before },
          { node: blank, chars: truth ? truth.length : 5 },
          { text: fact.after },
        ]}
      />
    </p>
  );
}
