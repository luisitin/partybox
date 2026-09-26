// The end of a Broken Pencil game is the summary — every book, first word → last guess — not a
// scoreboard (there are no points). The "summary" phase renders it, and the results stage keeps
// it up under "That's the show!" until Play again / New game / Home (review-loop #63) through
// clientModule.Finale.
import type { CSSProperties, JSX } from 'react';
import { BigText, useT } from '@partybox/game-sdk/ui';
import type { GameFinaleProps } from '@partybox/game-sdk/ui';
import type { PencilTvView } from '../server/views';
import { DrawingView } from './DrawingView';
import { STRINGS } from './strings';
import styles from './Tv.module.css';

export function Summary({ view }: { view: PencilTvView }): JSX.Element {
  const L = useT(STRINGS);
  const summary = view.summary ?? [];
  return (
    <>
      <BigText level="h1" tone="accent">
        {view.intactBooks === 1
          ? L('1 of {total} books survived', { total: view.bookCount })
          : L('{n} of {total} books survived', { n: view.intactBooks, total: view.bookCount })}
      </BigText>
      <p className={styles.kicker}>{L('every book, first word → last guess')}</p>
      {/* Seven or more books: four tighter columns, so two-row strips and three-line pairs keep
          the last row inside the overscan frame (pass 895: eight books ran to the frame's edge). */}
      <ul className={`${styles.summary} ${summary.length >= 7 ? styles.summaryMany : ''}`}>
        {summary.map((b, i) => (
          // I-022 A: rows land 80 ms apart; the verdict stamps after its row.
          <li
            key={b.ownerId}
            className={`${styles.summaryRow} ${styles.summaryIn}`}
            style={{ '--pb-i': i } as CSSProperties}
          >
            {/* I-218 B: the picture, not only the words */}
            <span className={styles.summaryDrawing}>
              {b.drawing && b.drawing.strokes.length > 0 ? (
                <DrawingView drawing={b.drawing} size="100%" label={L("{name}'s drawing", { name: b.ownerName })} />
              ) : (
                // nothing drawn: a blank sheet, not the page-sized "(nothing was drawn)" squeezed in
                <span className={styles.summaryBlank} aria-label={L('an empty sheet')}>—</span>
              )}
            </span>
            <span className={styles.summaryOwner}>{b.ownerName}</span>
            <span className={styles.summaryPair}>
              {b.word} → {b.last}
            </span>
            <span
              className={`${b.intact ? styles.intactMark : styles.brokenMark} ${styles.markStamp}`}
            >
              {b.intact ? L('✓ unbroken') : L('✕ broken')}
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
