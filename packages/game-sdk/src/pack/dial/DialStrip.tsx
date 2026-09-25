// A horizontal read-out of the dial (Tune In §5.5): the psychic's target with its 2 · 3 · 4 · 3 · 2
// zones (each number printed in its zone), and the phone stage's reveal — faces, the needle, the
// points. Static layout; the zones and faces rise in once, and nothing here takes a touch.
import type { CSSProperties, JSX } from 'react';
import { Avatar } from '../../ui/Avatar';
import styles from './DialStrip.module.css';
import { stackRings, wedges } from './geometry';

/** Keeps an end's arrow on its word when a label wraps (200 % text). */
const NBSP = '\u00a0';

export interface DialStripMark {
  id: string;
  pos: number;
  avatarId: string;
  pts?: number | null;
}

export interface DialStripProps {
  left: string;
  right: string;
  target: number | null;
  bands: readonly [number, number, number];
  marks?: readonly DialStripMark[];
  needle?: number | null;
  showPoints?: boolean;
  /** The labels under the bar (off where the screen already shows them). */
  showEnds?: boolean;
  className?: string;
  label?: string;
}

const ZONE: Record<2 | 3 | 4, string> = {
  2: styles.z2 ?? '',
  3: styles.z3 ?? '',
  4: styles.z4 ?? '',
};

export function DialStrip(props: DialStripProps): JSX.Element {
  const { left, right, target, bands, marks = [], needle = null, showPoints = false } = props;
  const { showEnds = true, className, label } = props;
  const rings = stackRings(
    marks.map((m) => m.pos),
    6,
  );
  const lift = Math.max(0, ...rings) + 1;
  return (
    <div
      className={`${styles.strip} ${className ?? ''}`}
      style={{ '--rows': marks.length > 0 ? lift : 0 } as CSSProperties}
      role="img"
      aria-label={label ?? `${left} — ${right}`}
    >
      <div className={styles.marks} aria-hidden>
        {marks.map((m, i) => (
          <span
            key={m.id}
            className={styles.mark}
            style={{ left: `${m.pos}%`, '--ring': rings[i] ?? 0, '--i': i } as CSSProperties}
          >
            <Avatar avatarId={m.avatarId} size={24} />
            {showPoints && m.pts !== null && m.pts !== undefined ? (
              <span className={styles.pts}>{m.pts > 0 ? `+${m.pts}` : '0'}</span>
            ) : null}
          </span>
        ))}
      </div>
      <div className={styles.bar}>
        {target !== null
          ? wedges(target, bands).map((w) => (
              <span
                key={`${w.from}-${w.pts}`}
                className={`${styles.zone} ${ZONE[w.pts]}`}
                style={{ left: `${w.from}%`, width: `${w.to - w.from}%` }}
              >
                {w.label !== null ? w.pts : ''}
              </span>
            ))
          : null}
        {needle !== null ? <span className={styles.needle} style={{ left: `${needle}%` }} /> : null}
        {/* Nothing on the bar yet: it scans, a radio looking for the station (never a dead box). */}
        {target === null && needle === null && marks.length === 0 ? (
          <span className={styles.scan} aria-hidden />
        ) : null}
      </div>
      {showEnds ? (
        <div className={styles.ends}>
          <span>{`◀${NBSP}${left}`}</span>
          <span className={styles.endRight}>{`${right}${NBSP}▶`}</span>
        </div>
      ) : null}
    </div>
  );
}
