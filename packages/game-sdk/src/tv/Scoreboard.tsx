// Ranked score list. Ties share a rank; the top rank is celebrated. Used by the core results
// screen and by games that show standings between rounds.
import type { JSX } from 'react';
import { Avatar } from '../ui/Avatar';
import styles from './Scoreboard.module.css';

export interface ScoreboardRow {
  playerId: string;
  name: string;
  avatarId: string;
  score: number;
  rank: number;
  /** Points gained since the last display (shown as +n). */
  delta?: number;
  connected?: boolean;
}

export interface ScoreboardProps {
  rows: ScoreboardRow[];
  /** Compact variant for the controller. */
  compact?: boolean;
  highlightId?: string | null;
}

export function Scoreboard({ rows, compact, highlightId }: ScoreboardProps): JSX.Element {
  return (
    <ol className={`${styles.board} ${compact ? styles.compact : ''}`} aria-label="scoreboard">
      {rows.map((row) => (
        <li
          key={row.playerId}
          className={`${styles.row} ${row.rank === 1 ? styles.top : ''} ${row.playerId === highlightId ? styles.me : ''}`}
        >
          <span className={styles.rank} aria-label={`rank ${row.rank}`}>
            {row.rank === 1 ? '🏆' : row.rank}
          </span>
          <Avatar
            avatarId={row.avatarId}
            dim={row.connected === false}
            size={compact ? 32 : 'var(--pb-chip-size)'}
          />
          <span className={styles.name}>{row.name}</span>
          {row.delta ? <span className={styles.delta}>+{row.delta}</span> : null}
          <span className={styles.score}>{row.score}</span>
        </li>
      ))}
    </ol>
  );
}
