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
  const finalNext = !final && view.round + 1 === view.rounds;
  // No contest to tease when the top rank is shared; an unanswered round says why the board is
  // all zeros instead of landing unexplained (review-loop #35).
  const tied = view.standings.filter((r) => r.rank === 1).length > 1;
  const silentRound = view.promptsPlayed === 0;
  return (
    <Stage center>
      <p className={styles.kicker}>
        {silentRound
          ? 'Nobody answered — no votes this round'
          : final
            ? 'Final round played'
            : `After round ${view.round} of ${view.rounds}`}
      </p>
      <BigText level="h1">{final ? 'Final scores' : 'Scores so far'}</BigText>
      {/* The hook goes above the board: at 5-6 players the bottom slot is the first thing clipped. */}
      {finalNext ? (
        <BigText level="h2" tone="accent">
          Next: the final round — double points!
        </BigText>
      ) : null}
      <div className={styles.board}>
        <Scoreboard rows={view.standings} noTrophy stagger="up" />
      </div>
      {final ? (
        <BigText level="h2" tone="accent">
          {tied ? "It's a tie" : 'And the winner is'}
          <span className={styles.ellipsis} aria-hidden>
            …
          </span>
        </BigText>
      ) : finalNext ? null : (
        <BigText level="h2" tone="muted">
          Next round coming up…
        </BigText>
      )}
    </Stage>
  );
}
