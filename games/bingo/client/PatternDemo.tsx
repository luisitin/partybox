// The round intro's pattern, shown by doing it (loop 243): a 5 × 5 of cells on the TV where the
// pattern lights up square by square, holds, wipes, and goes again — for "any line" it cycles a
// row, a column and a diagonal so the room sees "any" means any. A 10 Hz clock drives it; each
// cell's lit layer pops in with a CSS transition. Reduced motion: the pattern sits lit.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { usePrefersReducedMotion, useSoundApi } from '@partybox/game-sdk/ui';
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
  delayMs = 0,
  pattern,
  cells,
  size = 200,
  thump = false,
}: {
  pattern: Pattern;
  cells: number[];
  size?: number;
  /** The first pass thumps each cell as it lights (`daub`) — the TV's between-rounds preview. */
  thump?: boolean;
  /** I-103 C: hold the first pass this long (the board ranks first). */
  delayMs?: number;
}): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const shapes = demoShapes(pattern, cells);
  const last = shapes[shapes.length - 1];
  const loopMs = (last?.at ?? 0) + (last?.cells.length ?? 0) * STEP_MS + HOLD_MS + GAP_MS;
  const [t, setT] = useState(0);
  const sound = useSoundApi();
  // I-012 B: the first pass thumps — every cell that lights plays `daub`, the dauber's own
  // thump, once; the loops after it are silent. Keyed on the cells' serialised form (a fresh
  // array each render) so the clock starts once per demo.
  const cellsKey = cells.join(',');
  useEffect(() => {
    if (reduced) return;
    const started = Date.now() + delayMs; // I-103 C: the first pass waits for the board
    const shapes = demoShapes(pattern, cellsKey.split(',').map(Number));
    let lit = 0;
    const handle = setInterval(() => {
      const elapsed = Date.now() - started;
      if (elapsed < 0) return; // I-103 C: holding
      setT(elapsed % loopMs);
      if (thump && elapsed < loopMs) {
        const n = litAt(shapes, elapsed).size;
        if (n > lit) sound.play('daub');
        lit = n;
      }
    }, TICK_MS);
    return () => clearInterval(handle);
  }, [reduced, loopMs, thump, sound, pattern, cellsKey]);
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
