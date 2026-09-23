// Read-only rendering of a drawing as an inline SVG (crisp at any size, no canvas sizing dance).
// `null` = the artist never sent one: an empty sheet that says so.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { Drawing } from '../server/types';
import { CANVAS, PAPER, decodeDrawing } from './drawing';
import styles from './DrawingView.module.css';
import { STRINGS } from './strings';

export interface DrawingViewProps {
  drawing: Drawing | null;
  /** CSS size; the SVG scales. */
  size?: number | string;
  className?: string;
  label?: string;
}

function toPath(points: number[]): string {
  if (points.length < 2) return '';
  let d = `M${points[0]} ${points[1]}`;
  if (points.length === 2) d += ` l0.01 0`;
  for (let i = 2; i < points.length; i += 2) d += ` L${points[i]} ${points[i + 1]}`;
  return d;
}

export function DrawingView({
  drawing,
  size = '100%',
  className,
  label,
}: DrawingViewProps): JSX.Element {
  const L = useT(STRINGS);
  const strokes = decodeDrawing(drawing);
  const empty = strokes.length === 0;
  // Spans (display: block) so the view is also valid inside phrasing content such as a prompt <p>.
  return (
    <span className={`${styles.frame} ${className ?? ''}`} style={{ width: size }}>
      <svg
        viewBox={`0 0 ${CANVAS} ${CANVAS}`}
        className={styles.svg}
        role="img"
        aria-label={label ?? (empty ? L('an empty sheet') : L('a drawing'))}
      >
        <rect x="0" y="0" width={CANVAS} height={CANVAS} fill={PAPER} />
        {strokes.map((s, i) => (
          <path
            key={i}
            d={toPath(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      {empty ? <span className={styles.empty}>{L('(nothing was drawn)')}</span> : null}
    </span>
  );
}
