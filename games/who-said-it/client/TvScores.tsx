// TV during `scores` (and `done` in the preview): the board with this question's deltas, rows
// climbing from where they stood before it. "Nobody answered!" when the question made no cards.
import type { JSX } from 'react';
import { BigText, Scoreboard, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WsTvView } from '../server/views';
import { boardRows, previousOrder } from './board';
import { STRINGS } from './strings';
import styles from './tv.module.css';

export function TvScores({ view }: GameTvProps<WsTvView>): JSX.Element {
  const L = useT(STRINGS);
  const rows = boardRows(view);
  const zero = rows.every((r) => r.score === 0);
  const title =
    view.phaseId === 'done' || view.last
      ? L('Final scores')
      : L('Scores after question {n} of {total}', { n: view.n, total: view.total });
  return (
    <Stage center>
      {view.empty ? (
        <BigText level="h1" tone="accent" className={`${styles.nobody} pb-pop`}>
          {L('Nobody answered!')}
        </BigText>
      ) : null}
      <p className={styles.kicker}>{title}</p>
      <Scoreboard
        key={view.n}
        rows={rows}
        noTrophy={zero}
        noRanks={zero}
        stagger="climb"
        climbFrom={previousOrder(view)}
      />
    </Stage>
  );
}
