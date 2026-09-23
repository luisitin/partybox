// TV: the round scoreboard with deltas ("scores"). After the last round it is the drumroll for the
// engine's results screen: 'Final scores' + 'And the winner is…', crown withheld (noTrophy) so the
// core ceremony keeps it. results() ends the game in the same dispatch that enters 'done', so the
// engine's results screen is the ceremony — only the dev fixture preview renders 'done', and it
// renders as this final-scores screen.
import type { JSX } from 'react';
import { BigText, Scoreboard, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import { STRINGS } from './strings';
import styles from './wisecrack.module.css';

type Props = GameTvProps<WisecrackTvView>;

export function TvScores({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const final = view.round >= view.rounds;
  const finalNext = !final && view.round + 1 === view.rounds;
  // No contest to tease when the top rank is shared; an unanswered round says why the board is
  // all zeros instead of landing unexplained (review-loop #35).
  const tied = view.standings.filter((r) => r.rank === 1).length > 1;
  const silentRound = view.promptsPlayed === 0;
  // I-027: where every row stood before this round — by pre-delta score, ties in roster order
  // (after round 1 everyone was level: the roster IS the old board).
  const roster = new Map(view.players.map((p, i) => [p.id, i]));
  const climbFrom = [...view.standings]
    .sort(
      (a, b) =>
        b.score - b.delta - (a.score - a.delta) ||
        (roster.get(a.playerId) ?? 0) - (roster.get(b.playerId) ?? 0),
    )
    .map((r) => r.playerId);
  return (
    <Stage center>
      <p className={styles.kicker}>
        {silentRound
          ? L('Nobody answered — no votes this round')
          : final
            ? L('Final round played')
            : L('After round {round} of {rounds}', { round: view.round, rounds: view.rounds })}
      </p>
      <BigText level="h1">{final ? L('Final scores') : L('Scores so far')}</BigText>
      {/* The hook goes above the board: at 5-6 players the bottom slot is the first thing clipped. */}
      {finalNext ? (
        <BigText level="h2" tone="accent">
          {L('Next: the final round — double points!')}
        </BigText>
      ) : null}
      <div className={styles.board}>
        <Scoreboard rows={view.standings} noTrophy stagger="climb" climbFrom={climbFrom} />
      </div>
      {final ? (
        <BigText level="h2" tone="accent">
          {tied ? L("It's a tie") : L('And the winner is')}
          <span className={styles.ellipsis} aria-hidden>
            …
          </span>
        </BigText>
      ) : finalNext ? null : (
        <BigText level="h2" tone="muted">
          {L('Next round coming up…')}
        </BigText>
      )}
    </Stage>
  );
}
