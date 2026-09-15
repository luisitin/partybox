// Results on the stage: celebrate the winner, show the scoreboard and awards, tell the room
// what the VIP can do next.
import type { JSX } from 'react';
import type { RoomSnapshot } from '@partybox/shared';
import { BigText, Scoreboard, Stage } from '@partybox/game-sdk/ui';
import { scoreboardRows, winnerLine } from '../controller/results-rows';
import { t } from '../i18n';
import styles from './TvResults.module.css';

export interface TvResultsProps {
  room: RoomSnapshot;
}

export function TvResults({ room }: TvResultsProps): JSX.Element {
  const rows = scoreboardRows(room);
  const awards = room.results?.results.awards ?? [];
  const many = rows.length >= 7;
  const nameOf = (id: string): string =>
    room.results?.players.find((p) => p.id === id)?.name ?? '?';
  return (
    <Stage>
      <div className={`${styles.hero} pb-enter`}>
        <BigText level={many ? 'h1' : 'display'} tone="accent">
          {winnerLine(room) || t.results.title}
        </BigText>
      </div>
      <div className={`${styles.columns} ${awards.length === 0 ? styles.single : ''}`}>
        <Scoreboard rows={rows} />
        {awards.length > 0 ? (
          <ul className={styles.awards} aria-label="awards">
            {awards.map((a) => (
              <li key={a.id} className={styles.award}>
                <span className={styles.awardTitle}>{a.title}</span>
                <span className={styles.awardWho}>{nameOf(a.playerId)}</span>
                <span className="pb-muted pb-caption">{a.description}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="pb-muted pb-caption">
        {t.vip.badge}: {t.results.playAgain} · {t.results.newGame} · {t.results.lobby}
      </p>
    </Stage>
  );
}
