// TV: the round scoreboard with deltas ("scores") and the final standings with awards ("done").
import type { JSX } from 'react';
import { BigText, Scoreboard, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { WisecrackTvView } from '../server/index';
import styles from './wisecrack.module.css';

type Props = GameTvProps<WisecrackTvView>;

export function TvScores({ view }: Props): JSX.Element {
  const done = view.phaseId === 'done';
  const names = new Map(view.players.map((p) => [p.id, p.name]));
  return (
    <Stage center>
      <p className={styles.kicker}>
        {done ? 'Final standings' : `After round ${view.round} of ${view.rounds}`}
      </p>
      <BigText level="h1">{done ? "That's Wisecrack!" : 'Scores so far'}</BigText>
      <div className={styles.board}>
        <Scoreboard
          rows={view.standings.map((row) => ({ ...row, delta: done ? 0 : row.delta }))}
          noTrophy={!done}
        />
      </div>
      {done && view.awards.length > 0 ? (
        <ul className={styles.awards} aria-label="awards">
          {view.awards.map((award) => (
            <li key={award.id} className={styles.award}>
              <span className={styles.awardTitle}>{award.title}</span>
              <span>{names.get(award.playerId) ?? '?'}</span>
              <span className="pb-muted">· {award.description}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {!done && view.round < view.rounds ? (
        <BigText level="h2" tone="muted">
          {view.round + 1 === view.rounds
            ? 'Next: the final round — double points!'
            : 'Next round coming up…'}
        </BigText>
      ) : null}
    </Stage>
  );
}
