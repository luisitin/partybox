// The 5×5 card, used by both surfaces: tappable on the phone, read-only on the TV. Marks are
// never carried by colour alone — green cells get ✓, red cells ✕, missed pattern cells a dashed
// outline — so a check reads the same in every theme and for every viewer.
import { useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import styles from './Card.module.css';

const LETTERS = ['B', 'I', 'N', 'G', 'O'];
const FREE = 12;
/** I-006 B: the wipe lifts the daubs off this far apart, in reading order. */
const WIPE_STEP_MS = 40;

export interface CardProps {
  numbers: number[];
  daubs: number[];
  /** Highlighted as the pattern (intro / phones): dotted outline. */
  pattern?: number[];
  /** play: the squares that would win with one more daub (loop 420): a breathing outline. */
  wanted?: number[];
  /** Check / celebration marks. */
  green?: number[];
  red?: number[];
  missing?: number[];
  /** Phone only: tap to toggle. */
  onTap?: (index: number) => void;
  /** Phone only: the FREE square is tappable too (it always counts; daubing it is the fun part). */
  onTapFree?: () => void;
  /** Whether FREE shows as daubed (the TV and verdict cards: always). */
  freeDaubed?: boolean;
  disabled?: boolean;
  /** compact: three or four cards stacked on a phone — the same width, tighter cells. */
  size?: 'phone' | 'tv' | 'mini' | 'compact';
  /** A check or celebration: plain daubs step back so green / red / missing carry the story. */
  verdict?: boolean;
  /** Cells pop in one after another (a card landing on the TV for everyone to check). */
  reveal?: boolean;
  /**
   * A claim being checked: every daub starts as a plain outline; these cells turn over one at a
   * time, in this order — green (called), red (never called) or a dashed miss; the other tiles
   * keep their outline until `restShown`.
   */
  revealOrder?: readonly number[];
  revealStepMs?: number;
  /** After the ordered cells: every other tile takes its final look at once (a slow fade). */
  restShown?: boolean;
  /** After the reveal: misses outlined, the marks settled. */
  settled?: boolean;
  /** The claim just went up from this phone: the daubs flash once in a wave (loop 240). */
  sent?: boolean;
  /** A gold sweep along a winning line while its cells turn (the TV). */
  sweep?: { kind: SweepKind; index: number; ms: number } | null;
  /** The claim was wrong: the daubs lift off one by one in reading order (the TV's wipe, I-006 B). */
  wiped?: boolean;
}

export type SweepKind = 'row' | 'col' | 'diagA' | 'diagB';

const SWEEP_CLASS: Record<SweepKind, string> = {
  row: styles.sweepRow ?? '',
  col: styles.sweepCol ?? '',
  diagA: styles.sweepDiagA ?? '',
  diagB: styles.sweepDiagB ?? '',
};

/** Stagger between cells during a reveal; 25 cells ≈ 1 s before the verdict may land. */
export const REVEAL_STEP_MS = 40;

export function Card({
  numbers,
  daubs,
  pattern = [],
  wanted = [],
  green = [],
  red = [],
  missing = [],
  onTap,
  onTapFree,
  freeDaubed = true,
  disabled,
  size = 'phone',
  verdict = false,
  reveal = false,
  revealOrder,
  revealStepMs = 200,
  restShown = false,
  settled = true,
  sweep = null,
  sent = false,
  wiped = false,
}: CardProps): JSX.Element {
  const turnAt = new Map((revealOrder ?? []).map((i, k) => [i, k * revealStepMs]));
  const turning = revealOrder !== undefined;
  const daubed = new Set(daubs);
  const patternSet = new Set(pattern);
  const wantedSet = new Set(wanted);
  const greenSet = new Set(green);
  const redSet = new Set(red);
  const missingSet = new Set(missing);
  const interactive = onTap !== undefined && !disabled;
  // Which cells changed since the last daubs the card was given (the stamp plays on the one just
  // daubed, the lift on the one just cleared): "adjust state when a prop changes". A fresh card or
  // a reveal never stamps.
  const key = daubs.join(',');
  const [seen, setSeen] = useState({ key, was: daubs });
  if (seen.key !== key) setSeen({ key, was: daubs });
  const stamped = new Set<number>();
  const lifted = new Set<number>();
  // I-010 C: a stamp that completes a line (row, column or diagonal through it) bumps its five
  // cells in order — --pb-i is the cell's place along the line. FREE counts as daubed.
  const lineHit = new Map<number, number>();
  if (interactive && seen.key !== key) {
    const before = new Set(seen.was);
    for (const i of daubed) if (!before.has(i)) stamped.add(i);
    for (const i of before) if (!daubed.has(i)) lifted.add(i);
    for (const i of stamped)
      for (const line of linesThrough(i))
        if (line.every((k) => k === FREE || daubed.has(k)))
          line.forEach((k, place) => lineHit.set(k, place));
  }
  return (
    <div
      className={`${styles.card} ${styles[size]} ${reveal ? styles.reveal : ''}`}
      role="grid"
      aria-label="bingo card"
    >
      <div className={styles.head} role="row">
        {LETTERS.map((l) => (
          <span key={l} className={styles.letter} role="columnheader" data-letter={l}>
            {l}
          </span>
        ))}
      </div>
      <div className={styles.grid}>
        {sweep ? (
          <span
            className={`${styles.sweep} ${SWEEP_CLASS[sweep.kind]}`}
            style={
              { '--pb-sweep-i': sweep.index, '--pb-sweep-ms': `${sweep.ms}ms` } as CSSProperties
            }
            aria-hidden
            data-testid="sweep"
          />
        ) : null}
        {numbers.map((n, i) => {
          const isFree = i === FREE;
          const isDaubed = isFree ? freeDaubed : daubed.has(i);
          // During a reveal a daub is an outline until its beat (or until the rest is shown),
          // then flips to its colour; tiles outside the order fade to their final look together.
          const coloured = greenSet.has(i) || redSet.has(i) || missingSet.has(i);
          const ordered = turnAt.has(i);
          const showColour = !turning || ordered || restShown;
          const turns = turning && ordered && coloured;
          const pending = turning && isDaubed && !isFree && !showColour;
          const cls = [
            styles.cell,
            isDaubed ? styles.daubed : '',
            pending ? styles.pending : '',
            turning && !ordered && showColour ? styles.slowIn : '',
            verdict && !turning && isDaubed && !isFree && !coloured ? styles.dim : '',
            greenSet.has(i) && showColour ? (turns ? styles.turnGreen : styles.green) : '',
            redSet.has(i) && showColour ? (turns ? styles.turnRed : styles.red) : '',
            missingSet.has(i) && (settled || turns)
              ? turns
                ? styles.turnMissing
                : styles.missing
              : '',
            patternSet.has(i) && !isDaubed ? styles.pattern : '',
            wantedSet.has(i) && !isDaubed ? styles.wanted : '',
            isFree ? styles.free : '',
            stamped.has(i) ? styles.stamp : '',
            lineHit.has(i) ? styles.lineHit : '',
            sent && isDaubed ? styles.sent : '',
            lifted.has(i) ? styles.unstamp : '',
            wiped && isDaubed && !isFree ? styles.wipe : '',
          ].join(' ');
          const mark = !showColour ? null : greenSet.has(i) ? '✓' : redSet.has(i) ? '✕' : null;
          const label = isFree ? 'FREE' : String(n);
          const shown = isFree && size === 'compact' ? '★' : label;
          const Tag = interactive && (!isFree || onTapFree) ? 'button' : 'div';
          const style =
            wiped && isDaubed && !isFree
              ? ({ animationDelay: `${i * WIPE_STEP_MS}ms` } as CSSProperties)
              : reveal
                ? ({ animationDelay: `${i * REVEAL_STEP_MS}ms` } as CSSProperties)
                : turns
                  ? ({ animationDelay: `${turnAt.get(i) ?? 0}ms` } as CSSProperties)
                  : sent && isDaubed
                    ? ({ animationDelay: `${i * 18}ms` } as CSSProperties)
                    : lineHit.has(i)
                      ? ({ '--pb-i': lineHit.get(i) } as CSSProperties)
                      : undefined;
          return (
            <Tag
              key={i}
              type={Tag === 'button' ? 'button' : undefined}
              className={cls}
              style={style}
              role="gridcell"
              aria-pressed={Tag === 'button' ? isDaubed : undefined}
              aria-label={`${LETTERS[i % 5]} ${label}${isDaubed ? ', daubed' : ''}`}
              onClick={Tag === 'button' ? () => (isFree ? onTapFree?.() : onTap?.(i)) : undefined}
            >
              <span className={styles.number}>{shown}</span>
              {mark ? (
                <span className={styles.mark} aria-hidden>
                  {mark}
                </span>
              ) : null}
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

/** The row, the column and any diagonal through cell `i`, each as its five indices in order. */
function linesThrough(i: number): number[][] {
  const r = Math.floor(i / 5);
  const c = i % 5;
  const five = [0, 1, 2, 3, 4];
  const lines = [five.map((k) => r * 5 + k), five.map((k) => k * 5 + c)];
  if (r === c) lines.push(five.map((k) => k * 6));
  if (r + c === 4) lines.push(five.map((k) => 4 + k * 4));
  return lines;
}

/** Tiny pattern icon: the shape the round is after, nothing else. */
export function PatternIcon({
  cells,
  size = 48,
  draw = false,
}: {
  cells: number[];
  size?: number;
  /** I-107 B: the lit cells draw in one after another (opacity only). */
  draw?: boolean;
}): JSX.Element {
  const set = new Set(cells);
  const order = new Map(cells.map((c, i) => [c, i]));
  return (
    <span
      className={styles.icon}
      style={{ width: size, height: size }}
      aria-hidden
      data-testid="pattern-icon"
    >
      {Array.from({ length: 25 }, (_, i) => (
        <span
          key={i}
          className={`${styles.iconCell} ${set.has(i) ? styles.iconOn : ''} ${draw && set.has(i) ? styles.iconDraw : ''}`}
          style={draw && set.has(i) ? { animationDelay: `${(order.get(i) ?? 0) * 70}ms` } : undefined}
        />
      ))}
    </span>
  );
}
