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
  /** `3` / `4`: that many body-size columns from any count — a board under a three- or four-row
   *  roster (Lightning's wager page: two columns of six rows ran into the host bar at 12 players,
   *  and three columns of six clipped at 16). */
  columns?: 2 | 3 | 4;
  /** Rows to mark with a ✓ in the delta slot when they carry no delta (e.g. "wager placed"). */
  markIds?: readonly string[];
  /**
   * Entrance order: `up` (default) lands last place first and the leader last; `down` lands rank
   * 1 first at half spacing (standings before a decision); `false` renders the board at once.
   * Ignored on `compact`. Remount (a `key`) to replay it. `climb` (I-027): rows appear where they
   * stood in `climbFrom` (player ids, previous order), then slide to their new places once the
   * totals have counted — the round's overtakes, watched.
   */
  stagger?: 'up' | 'down' | 'climb' | false;
  /** With `climb`: the previous order of the same players (ids). Missing ids are treated as unmoved. */
  climbFrom?: readonly string[];
}

type Tier = 'compact' | 'roomy' | 'tight' | 'dense' | 'tight3' | 'tight4';

const COLUMNS: Record<Tier, number> = {
  compact: 1,
  roomy: 1,
  tight: 1,
  dense: 2,
  tight3: 3,
  tight4: 4,
};

export function tierOf(
  count: number,
  compact?: boolean,
  dense?: boolean,
  columns?: 2 | 3 | 4,
): Tier {
  if (compact) return 'compact';
  if (columns === 4) return 'tight4';
  if (count >= 13 || columns === 3) return 'tight3';
  if (dense ?? count >= 7) return 'dense';
  if (count >= 5) return 'tight';
  return 'roomy';
}

/** When the last row of a staggered board has risen (ms after mount): the totals count up from
 *  here, and a game can deal whatever sits beside the board on this beat instead of guessing.
 *  Compact boards do not stagger, so they land at once. */
export function boardLandedMs(
  count: number,
  opts: {
    compact?: boolean;
    dense?: boolean;
    columns?: 2 | 3 | 4;
    stagger?: 'up' | 'down' | 'climb' | false;
  } = {},
): number {
  if (opts.compact || opts.stagger === false) return 0;
  if (opts.stagger === 'climb') return MOTION_BASE; // rows fade in together; the deltas follow
  const cols = COLUMNS[tierOf(count, opts.compact, opts.dense, opts.columns)];
  // Half spacing on the multi-column tiers and for `down`, so 16 rows still land inside ~1.2 s;
  // mirrors --pb-stagger-step in the CSS.
  const stepMs = cols > 1 || opts.stagger === 'down' ? MOTION_FAST / 2 : MOTION_FAST;
  return stepMs * Math.max(0, count - 1) + MOTION_BASE;
}

/** The total, counting up from its pre-delta value once the board has landed. */
function Score({ row, delayMs }: { row: ScoreboardRow; delayMs: number }): JSX.Element {
  const shown = useCountUp(row.score, row.score - (row.delta ?? 0), MOTION_SLOW, delayMs);
  return <span className={styles.score}>{shown}</span>;
}

/** I-027: how many rows away a row is from where it stood before — the slide starts that many
 *  rows down, so positive = it stood lower = it climbed (pass 865: the glows read it backwards).
 *  A row that was not on the previous board has not moved. */
export function climbOffset(previous: readonly string[], id: string, index: number): number {
  const was = previous.indexOf(id);
  return (was < 0 ? index : was) - index;
}

export function Scoreboard({
  rows,
  compact,
  highlightId,
  noTrophy,
  dense,
  size = 'md',
  columns,
  markIds = [],
  stagger = 'up',
  climbFrom = [],
}: ScoreboardProps): JSX.Element {
  const tier = tierOf(rows.length, compact, dense, columns);
  const cols = COLUMNS[tier];
  const winners = rows.filter((r) => r.rank === 1).length;
  const trophy = !noTrophy && winners < rows.length;
  const climb = !compact && stagger === 'climb';
  const staggered = !compact && stagger !== false && !climb;
  const order = (index: number): number => (stagger === 'down' ? index : rows.length - 1 - index);
  const from = (row: ScoreboardRow, index: number): number =>
    climbOffset(climbFrom, row.playerId, index);
  const countDelayMs = boardLandedMs(rows.length, { compact, dense, columns, stagger });
  return (
    <ol
      className={`${styles.board} ${tier === 'roomy' ? '' : styles[tier]} ${size === 'lg' ? styles.lg : size === 'sm' ? styles.sm : ''} ${staggered ? styles.staggered : ''} ${staggered && stagger === 'down' ? styles.down : ''} ${climb ? styles.climb : ''}`}
      style={{ '--pb-board-rows': Math.ceil(rows.length / cols) } as CSSProperties}
      aria-label="scoreboard"
    >
      {rows.map((row, index) => (
        <li
          key={row.playerId}
          className={`${styles.row} ${row.rank === 1 && trophy ? styles.top : ''} ${row.playerId === highlightId ? styles.me : ''} ${climb && from(row, index) > 0 ? styles.rose : ''} ${climb && from(row, index) < 0 ? styles.fell : ''}`}
          aria-current={row.playerId === highlightId ? 'true' : undefined}
          style={
            staggered
              ? ({ '--pb-i': order(index) } as CSSProperties)
              : climb
                ? ({ '--pb-from': from(row, index) } as CSSProperties)
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
          ) : markIds.includes(row.playerId) ? (
            <span className={styles.mark} aria-label="wager placed">
              ✓
            </span>
          ) : null}
          {staggered || climb ? (
            <Score row={row} delayMs={countDelayMs} />
          ) : (
            <span className={styles.score}>{row.score}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
