// The end of a Broken Pencil game is the summary — every book, first word → last guess — not a
// scoreboard (there are no points). The "summary" phase renders it, and the results stage keeps
// it up under "That's the show!" until Play again / New game / Home (review-loop #63) through
// clientModule.Finale.
import type { CSSProperties, JSX } from 'react';
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
        {summary.map((b, i) => (
          // I-022 A: rows land 80 ms apart; the verdict stamps after its row.
          <li key={b.ownerId} className={`${styles.summaryRow} ${styles.summaryIn}`} style={{ '--pb-i': i } as CSSProperties}>
            <span className={styles.summaryOwner}>{b.ownerName}</span>
            {/* I-022 B: the chain — every page as a pill, drawings as a pencil between the words. */}
            <span className={styles.chain}>
              {b.pages.map((p, k) =>
                p.kind === 'draw' ? (
                  <span key={k} className={styles.chainPencil} aria-label="a drawing">
                    ✏
                  </span>
                ) : (
                  <span key={k} className={`${styles.chainPill} ${p.kind === 'word' ? styles.chainWord : ''}`}>
                    {p.kind === 'word' ? p.text : (p.text ?? '???')}
                  </span>
                ),
              )}
            </span>
            <span className={`${b.intact ? styles.intactMark : styles.brokenMark} ${styles.markStamp}`}>
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
