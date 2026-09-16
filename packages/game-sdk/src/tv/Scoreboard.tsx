// Ranked score list. Ties share a rank; the top rank is celebrated. Used by the core results
// screen and by games that show standings between rounds.
// Tiers keep any count on a 1080p stage under a heading: roomy (≤ 4, h2 rows), tight (5–6, body
// rows), dense (7–12, two h2 columns), tight3 (13+, three body columns); the multi-column tiers
// flow column-major so ranks read down, not across.
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
  /** Force (true) or suppress (false) the two-column tier; 13+ rows always go three-column. */
  dense?: boolean;
  /** Rows to mark with a ✓ in the delta slot when they carry no delta (e.g. "wager placed"). */
  markIds?: readonly string[];
}

type Tier = 'compact' | 'roomy' | 'tight' | 'dense' | 'tight3';

const COLUMNS: Record<Tier, number> = { compact: 1, roomy: 1, tight: 1, dense: 2, tight3: 3 };

export function tierOf(count: number, compact?: boolean, dense?: boolean): Tier {
  if (compact) return 'compact';
  if (count >= 13) return 'tight3';
  if (dense ?? count >= 7) return 'dense';
  if (count >= 5) return 'tight';
  return 'roomy';
}

export function Scoreboard({
  rows,
  compact,
  highlightId,
  noTrophy,
  dense,
  markIds = [],
}: ScoreboardProps): JSX.Element {
  const tier = tierOf(rows.length, compact, dense);
  const cols = COLUMNS[tier];
  const winners = rows.filter((r) => r.rank === 1).length;
  const trophy = !noTrophy && winners < rows.length;
  return (
    <ol
      className={`${styles.board} ${tier === 'roomy' ? '' : styles[tier]}`}
      style={{ '--pb-board-rows': Math.ceil(rows.length / cols) } as CSSProperties}
      aria-label="scoreboard"
    >
      {rows.map((row) => (
        <li
          key={row.playerId}
          className={`${styles.row} ${row.rank === 1 && trophy ? styles.top : ''} ${row.playerId === highlightId ? styles.me : ''}`}
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
          ) : markIds.includes(row.playerId) ? (
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
