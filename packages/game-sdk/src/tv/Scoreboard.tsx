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
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar } from '../ui/Avatar';
import { useT } from '../ui/lang';
import { MOTION_BASE, MOTION_FAST, MOTION_SLOW, useCountUp } from '../ui/motion';
import styles from './Scoreboard.module.css';
import { STRINGS } from './strings';

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
  /** I-019: hold every total as "—" this long after mount, then count up from zero (a reveal). */
  holdMs?: number;
  /** I-128 B: no rank numbers (an all-zero board has nothing to rank). */
  noRanks?: boolean;
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
function Score({
  row,
  delayMs,
  holdMs = 0,
}: {
  row: ScoreboardRow;
  delayMs: number;
  holdMs?: number;
}): JSX.Element {
  // I-019 A: with a hold the total shows "—" until the hold has passed, then counts up from zero.
  const start = Math.max(delayMs, holdMs);
  const held = useHeld(holdMs);
  const shown = useCountUp(
    row.score,
    holdMs > 0 ? 0 : row.score - (row.delta ?? 0),
    MOTION_SLOW,
    start,
  );
  return <span className={styles.score}>{held ? '—' : shown}</span>;
}

/** True until `ms` after mount (0 = never held). */
function useHeld(ms: number): boolean {
  const [held, setHeld] = useState(ms > 0);
  useEffect(() => {
    if (ms <= 0) return;
    const t = setTimeout(() => setHeld(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return held;
}

/** I-027: how many rows away a row is from where it stood before — the slide starts that many
 *  rows down, so positive = it stood lower = it climbed (pass 865: the glows read it backwards).
 *  A row that was not on the previous board has not moved. */
export function climbOffset(previous: readonly string[], id: string, index: number): number {
  const was = previous.indexOf(id);
  return (was < 0 ? index : was) - index;
}

/**
 * I-146 C: rows on the same rank are bracketed down the left edge — a four-way tie stops depending
 * on four identical digits being noticed. `top` / `end` cap the bracket; null = not in a tie. A
 * bracket never crosses a column break (the board flows column-major, `perCol` rows a column): it
 * would dangle off the foot of one column and draw an uncapped bar down the gap of the next.
 */
export function tieEdges(
  ranks: readonly number[],
  i: number,
  perCol: number,
): { top: boolean; end: boolean } | null {
  const r = ranks[i];
  if (r === undefined) return null;
  const up = i % perCol !== 0 && ranks[i - 1] === r;
  const down = (i + 1) % perCol !== 0 && ranks[i + 1] === r;
  return up || down ? { top: !up, end: !down } : null;
}

/** I-146 B: the rank band over a split column's first row ("1–6", or "4" when the column is one
 *  tie), so a column edge reads as a continuation of the ranking, not a second list. */
export function rankBand(ranks: readonly number[], index: number, perCol: number): string | null {
  if (index % perCol !== 0) return null;
  const first = ranks[index];
  const last = ranks[Math.min(index + perCol - 1, ranks.length - 1)];
  if (first === undefined || last === undefined) return null;
  return first === last ? `${first}` : `${first}–${last}`;
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
  holdMs = 0,
  noRanks = false,
}: ScoreboardProps): JSX.Element {
  const L = useT(STRINGS);
  const tier = tierOf(rows.length, compact, dense, columns);
  const cols = COLUMNS[tier];
  const winners = rows.filter((r) => r.rank === 1).length;
  // I-476 B: a place held by more than one row reads "=3" on each of them
  const shared = (rank: number): boolean => rows.filter((r) => r.rank === rank).length > 1;
  const trophy = !noTrophy && winners < rows.length;
  const climb = !compact && stagger === 'climb';
  const heldRanks = useHeld(holdMs); // I-019 A: ranks show "·" through the hold as well
  const staggered = !compact && stagger !== false && !climb;
  const order = (index: number): number => (stagger === 'down' ? index : rows.length - 1 - index);
  const from = (row: ScoreboardRow, index: number): number =>
    climbOffset(climbFrom, row.playerId, index);
  const countDelayMs = boardLandedMs(rows.length, { compact, dense, columns, stagger });
  const perCol = Math.ceil(rows.length / cols);
  const ranks = rows.map((r) => r.rank);
  const tieClass = (i: number): string => {
    const tie = noRanks ? null : tieEdges(ranks, i, perCol);
    if (!tie) return '';
    return `${styles.tied ?? ''} ${tie.top ? (styles.tieTop ?? '') : ''} ${tie.end ? (styles.tieEnd ?? '') : ''}`;
  };
  const bandFor = (index: number): string | null =>
    cols < 2 || noRanks ? null : rankBand(ranks, index, perCol);
  return (
    <ol
      className={`${styles.board} ${tier === 'roomy' ? '' : styles[tier]} ${size === 'lg' ? styles.lg : size === 'sm' ? styles.sm : ''} ${staggered ? styles.staggered : ''} ${staggered && stagger === 'down' ? styles.down : ''} ${climb ? styles.climb : ''}`}
      style={{ '--pb-board-rows': Math.ceil(rows.length / cols) } as CSSProperties}
      aria-label={L('scoreboard')}
    >
      {rows.map((row, index) => (
        <li
          key={row.playerId}
          className={`${styles.row} ${tieClass(index)}${row.rank === 1 && trophy ? styles.top : ''} ${row.playerId === highlightId ? styles.me : ''} ${climb && from(row, index) > 0 ? styles.rose : ''} ${climb && from(row, index) < 0 ? styles.fell : ''}`}
          aria-current={row.playerId === highlightId ? 'true' : undefined}
          style={
            staggered
              ? ({ '--pb-i': order(index) } as CSSProperties)
              : climb
                ? ({ '--pb-from': from(row, index) } as CSSProperties)
                : undefined
          }
        >
          {bandFor(index) ? (
            <span className={styles.band} aria-hidden>
              {bandFor(index)}
            </span>
          ) : null}
          <span
            className={styles.rank}
            aria-label={
              shared(row.rank)
                ? L('tied, rank {rank}', { rank: row.rank })
                : L('rank {rank}', { rank: row.rank })
            }
          >
            {noRanks
              ? ''
              : heldRanks
                ? '·'
                : row.rank === 1 && trophy
                  ? '🏆'
                  : shared(row.rank)
                    ? `=${row.rank}`
                    : row.rank}
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
            <span className={styles.mark} aria-label={L('wager placed')}>
              ✓
            </span>
          ) : null}
          {staggered || climb ? (
            <Score row={row} delayMs={countDelayMs} holdMs={holdMs} />
          ) : (
            <span className={styles.score}>{row.score}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
