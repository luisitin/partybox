// Ranked score list. Ties share a rank; the top rank is celebrated. Used by the core results
// screen and by games that show standings between rounds.
// Tiers keep any count on a 1080p stage under a heading: roomy (≤ 4, h2 rows), tight (5–6, body
// rows), dense (7–12, two h2 columns), tight3 (13+, three body columns); the multi-column tiers
// flow column-major so ranks read down, not across.
// Entrance (TV tiers; off on compact): rows rise one by one, each delta lands a beat after its
// row, and once the last row is in every total counts up from (score − delta) together (counting
// while rows were still arriving read as two competing motions — review-loop #32); the leader's
// trophy pops last. Everything runs on the motion tokens, so reduced motion renders the final
// board at once.
import type { CSSProperties, JSX } from 'react';
import { Avatar } from '../ui/Avatar';
import { MOTION_BASE, MOTION_FAST, MOTION_SLOW, useCountUp } from '../ui/motion';
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
  /** `lg`: large rows for a board that owns the stage (results at 7–8 players, review-loop #32);
   *  `sm`: body-size rows for a two-column board under a tall header (a 12-player wager screen,
   *  review-loop #53). */
  size?: 'sm' | 'md' | 'lg';
  /** Rows to mark with a ✓ in the delta slot when they carry no delta (e.g. "wager placed"). */
  markIds?: readonly string[];
  /**
   * Entrance order: `up` (default) lands last place first and the leader last; `down` lands rank
   * 1 first at half spacing (standings before a decision); `false` renders the board at once.
   * Ignored on `compact`. Remount (a `key`) to replay it.
   */
  stagger?: 'up' | 'down' | false;
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

/** The total, counting up from its pre-delta value once the board has landed. */
function Score({ row, delayMs }: { row: ScoreboardRow; delayMs: number }): JSX.Element {
  const shown = useCountUp(row.score, row.score - (row.delta ?? 0), MOTION_SLOW, delayMs);
  return <span className={styles.score}>{shown}</span>;
}

export function Scoreboard({
  rows,
  compact,
  highlightId,
  noTrophy,
  dense,
  size = 'md',
  markIds = [],
  stagger = 'up',
}: ScoreboardProps): JSX.Element {
  const tier = tierOf(rows.length, compact, dense);
  const cols = COLUMNS[tier];
  const winners = rows.filter((r) => r.rank === 1).length;
  const trophy = !noTrophy && winners < rows.length;
  const staggered = !compact && stagger !== false;
  // Half spacing on the multi-column tiers and for `down`, so 16 rows still land inside ~1.2 s;
  // mirrors --pb-stagger-step in the CSS.
  const stepMs = cols > 1 || stagger === 'down' ? MOTION_FAST / 2 : MOTION_FAST;
  const order = (index: number): number => (stagger === 'down' ? index : rows.length - 1 - index);
  const countDelayMs = stepMs * Math.max(0, rows.length - 1) + MOTION_BASE;
  return (
    <ol
      className={`${styles.board} ${tier === 'roomy' ? '' : styles[tier]} ${size === 'lg' ? styles.lg : size === 'sm' ? styles.sm : ''} ${staggered ? styles.staggered : ''} ${staggered && stagger === 'down' ? styles.down : ''}`}
      style={{ '--pb-board-rows': Math.ceil(rows.length / cols) } as CSSProperties}
      aria-label="scoreboard"
    >
      {rows.map((row, index) => (
        <li
          key={row.playerId}
          className={`${styles.row} ${row.rank === 1 && trophy ? styles.top : ''} ${row.playerId === highlightId ? styles.me : ''}`}
          aria-current={row.playerId === highlightId ? 'true' : undefined}
          style={staggered ? ({ '--pb-i': order(index) } as CSSProperties) : undefined}
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
          {staggered ? (
            <Score row={row} delayMs={countDelayMs} />
          ) : (
            <span className={styles.score}>{row.score}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
