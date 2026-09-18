// The round intro's pattern, shown by doing it (loop 243): a 5 × 5 of cells on the TV where the
// pattern lights up square by square, holds, wipes, and goes again — for "any line" it cycles a
// row, a column and a diagonal so the room sees "any" means any. A 10 Hz clock drives it; each
// cell's lit layer pops in with a CSS transition. Reduced motion: the pattern sits lit.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { usePrefersReducedMotion } from '@partybox/game-sdk/ui';
import type { Pattern } from '../server/types';
import styles from './PatternDemo.module.css';

/** A row, a column, a diagonal: what "any line" can mean, in the order they play. */
const LINE_SHAPES: number[][] = [
  [10, 11, 12, 13, 14],
  [2, 7, 12, 17, 22],
  [0, 6, 12, 18, 24],
];
const STEP_MS = 140;
const HOLD_MS = 900;
const GAP_MS = 300;
const TICK_MS = 50;

/** The shapes the demo plays, in order, and when each starts (ms into the loop). */
export function demoShapes(pattern: Pattern, cells: number[]): { cells: number[]; at: number }[] {
  const shapes = pattern === 'line' ? LINE_SHAPES : [cells];
  let at = 0;
  return shapes.map((c) => {
    const start = at;
    at += c.length * STEP_MS + HOLD_MS + GAP_MS;
    return { cells: c, at: start };
  });
}

/** Which cells are lit `t` ms into the loop. */
export function litAt(shapes: { cells: number[]; at: number }[], t: number): Set<number> {
  const lit = new Set<number>();
  for (const s of shapes) {
    const local = t - s.at;
    if (local < 0 || local >= s.cells.length * STEP_MS + HOLD_MS) continue;
    const n = Math.min(s.cells.length, Math.floor(local / STEP_MS) + 1);
    for (let k = 0; k < n; k += 1) lit.add(s.cells[k] ?? -1);
  }
  return lit;
}

export function PatternDemo({
  pattern,
  cells,
  size = 200,
}: {
  pattern: Pattern;
  cells: number[];
  size?: number;
}): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const shapes = demoShapes(pattern, cells);
  const last = shapes[shapes.length - 1];
  const loopMs = (last?.at ?? 0) + (last?.cells.length ?? 0) * STEP_MS + HOLD_MS + GAP_MS;
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const started = Date.now();
    const handle = setInterval(() => setT((Date.now() - started) % loopMs), TICK_MS);
    return () => clearInterval(handle);
  }, [reduced, loopMs]);
  const lit = reduced ? new Set(cells) : litAt(shapes, t);
  return (
    <span
      className={styles.demo}
      style={{ width: size, height: size }}
      aria-hidden
      data-testid="pattern-demo"
    >
      {Array.from({ length: 25 }, (_, i) => (
        <span key={i} className={`${styles.cell} ${lit.has(i) ? styles.on : ''}`} />
      ))}
    </span>
  );
}
