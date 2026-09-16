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
  /** Force (true) or suppress (false) the two-column tier; default: from 7 rows. */
  dense?: boolean;
  /** Rows whose id is listed and that carry no delta show a ✓ in the delta slot (e.g. wager placed). */
  markIds?: string[];
  /** Rows rise one after another: 'up' = last place first (leader lands last), 'down' = rank 1 first. */
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
  dense: denseProp,
  markIds,
  stagger,
}: ScoreboardProps): JSX.Element {
  const dense = !compact && (denseProp ?? rows.length >= DENSE_FROM);
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
          {row.delta ? (
            <span className={styles.delta}>+{row.delta}</span>
          ) : markIds?.includes(row.playerId) ? (
            <span className={styles.mark} aria-label="wager placed">
              ✓
            </span>
          ) : null}
          <span className={styles.score}>{row.score}</span>
        </li>
      ))}
    </ol>
  );
}
