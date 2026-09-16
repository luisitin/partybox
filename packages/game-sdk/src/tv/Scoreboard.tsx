// Ranked score list. Ties share a rank; the top rank is celebrated. Used by the core results
// screen and by games that show standings between rounds.
import type { CSSProperties, JSX } from 'react';
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
  /** Hide the 🏆 (everyone tied, or nobody scored). */
  noTrophy?: boolean;
  /** Rows rise one after another — 'up' lands last place first and the leader last, 'down' the
   *  reverse at half spacing; deltas follow their row, the 🏆 pops last. Off by default. */
  stagger?: 'up' | 'down';
}

// Past six rows the TV board would run off a 1080p stage at h2 size, so it drops to body size and
// two columns (16 players = 8 rows ≈ 500 px).
const DENSE_FROM = 7;

export function Scoreboard({
  rows,
  compact,
  highlightId,
  noTrophy,
  stagger,
}: ScoreboardProps): JSX.Element {
  const dense = !compact && rows.length >= DENSE_FROM;
  const winners = rows.filter((r) => r.rank === 1).length;
  const trophy = !noTrophy && winners < rows.length;
  return (
    <ol
      className={`${styles.board} ${compact ? styles.compact : ''} ${dense ? styles.dense : ''} ${stagger ? styles.staggered : ''} ${stagger === 'down' ? styles.staggerDown : ''}`}
      aria-label="scoreboard"
    >
      {rows.map((row, index) => (
        <li
          key={row.playerId}
          className={`${styles.row} ${row.rank === 1 && trophy ? styles.top : ''} ${row.playerId === highlightId ? styles.me : ''}`}
          style={
            stagger
              ? ({ '--pb-i': stagger === 'up' ? rows.length - 1 - index : index } as CSSProperties)
              : undefined
          }
        >
          <span className={styles.rank} aria-label={`rank ${row.rank}`}>
            {row.rank === 1 && trophy ? '🏆' : row.rank}
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
