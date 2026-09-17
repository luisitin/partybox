// The end of a Broken Pencil game is the summary — every book, first word → last guess — not a
// scoreboard (there are no points). The "summary" phase renders it, and the results stage keeps
// it up under "That's the show!" until Play again / New game / Home (review-loop #63) through
// clientModule.Finale.
import type { JSX } from 'react';
import { BigText } from '@partybox/game-sdk/ui';
import type { GameFinaleProps } from '@partybox/game-sdk/ui';
import type { PencilTvView } from '../server/views';
import styles from './Tv.module.css';

export function Summary({ view }: { view: PencilTvView }): JSX.Element {
  const summary = view.summary ?? [];
  return (
    <>
      <BigText level="h1" tone="accent">
        {view.intactBooks} of {view.bookCount} books survived
      </BigText>
      <p className={styles.kicker}>every book, first word → last guess</p>
      <ul className={styles.summary}>
        {summary.map((b) => (
          <li key={b.ownerId} className={styles.summaryRow}>
            <span className={styles.summaryOwner}>{b.ownerName}</span>
            <span className={styles.summaryPair}>
              {b.word} → {b.last}
            </span>
            <span className={b.intact ? styles.intactMark : styles.brokenMark}>
              {b.intact ? '✓ unbroken' : '✕ broken'}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function Finale({ lastView }: GameFinaleProps<PencilTvView>): JSX.Element | null {
  if (!lastView.summary) return null;
  return <Summary view={lastView} />;
}
