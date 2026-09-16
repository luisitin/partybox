// TV: the round scoreboard with deltas ("scores"). After the last round it is the drumroll for the
// engine's results screen: 'Final scores' + 'And the winner is…', crown withheld (noTrophy) so the
// core ceremony keeps it. results() ends the game in the same dispatch that enters 'done', so the
// engine's results screen is the ceremony — only the dev fixture preview renders 'done', and it
// renders as this final-scores screen.
import type { JSX } from 'react';
import { BigText, Scoreboard, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import styles from './wisecrack.module.css';

type Props = GameTvProps<WisecrackTvView>;

export function TvScores({ view }: Props): JSX.Element {
  const final = view.round >= view.rounds;
  return (
    <Stage center>
      <p className={styles.kicker}>
        {final ? 'Final round played' : `After round ${view.round} of ${view.rounds}`}
      </p>
      <BigText level="h1">{final ? 'Final scores' : 'Scores so far'}</BigText>
      <div className={styles.board}>
        <Scoreboard rows={view.standings} noTrophy />
      </div>
      {final ? (
        <BigText level="h2" tone="accent">
          And the winner is
          <span className={styles.ellipsis} aria-hidden>
            …
          </span>
        </BigText>
      ) : (
        <BigText level="h2" tone="muted">
          {view.round + 1 === view.rounds
            ? 'Next: the final round — double points!'
            : 'Next round coming up…'}
        </BigText>
      )}
    </Stage>
  );
}
