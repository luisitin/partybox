// The TV dial (P00 §6, Tune In §5.5): a semicircle gauge with the two ends at its feet, the target's
// five wedges (2 · 3 · 4 · 3 · 2, each number printed inside, so colour is never the only signal)
// under a shutter that swings away around the pivot (transform only), a needle, and the players'
// faces riding arms from the pivot so a huddle glides and a reveal lands without layout work.
import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX, ReactNode, RefObject } from 'react';
import { Avatar } from '../../ui/Avatar';
import styles from './Dial.module.css';
import { BOX, faceLayout, fanOut, pointAt, posToDeg, slicePath, wedges } from './geometry';
import type { FaceLayout } from './geometry';

/** Keeps an end's arrow on its word when a label wraps (200 % text). */
const NBSP = '\u00a0';

export interface DialMarker {
  id: string;
  pos: number;
  avatarId: string;
  /** "+4" over the face once `showPoints` (null: nothing). */
  pts?: number | null;
}

export interface DialProps {
  left: string;
  right: string;
  /** The target; null keeps the face blank under the shutter (nothing to leak). */
  target: number | null;
  /** The 4 / 3 / 2 band edges for the target size. */
  bands: readonly [number, number, number];
  /** Shutter state. `swing` animates it open on mount (the reveal); otherwise it is just open. */
  open: boolean;
  swing?: boolean;
  markers?: readonly DialMarker[];
  /** Faces land one after another (reveal) instead of gliding (huddle). */
  landing?: boolean;
  needle?: number | null;
  /** The needle swings up from rest to its spot (reveal) instead of following live. */
  needleSettles?: boolean;
  /** A badge on the needle's tip ("+3"). */
  needleBadge?: ReactNode;
  showPoints?: boolean;
  /** The face flips toward the room as a new dial comes up. */
  entrance?: boolean;
  /** Stagger unit for landing faces (ms); the first lands after the shutter. */
  landGapMs?: number;
  className?: string;
  label?: string;
}

const TICKS = Array.from({ length: 21 }, (_, i) => i * 5);
const f = (n: number): string => n.toFixed(2);
const ZONE_CLASS: Record<2 | 3 | 4, string> = {
  2: styles.zone2 ?? '',
  3: styles.zone3 ?? '',
  4: styles.zone4 ?? '',
};

/** The box's drawn width in CSS px (layout width, so a scaled stage does not skew it), measured
 *  before paint and again when it resizes; 0 until measured. */
function useBoxPx(ref: RefObject<HTMLDivElement | null>): number {
  const [px, setPx] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = (): void => setPx(Math.round(el.offsetWidth / 8) * 8);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return px;
}

function faceStyle(
  pos: number,
  ring: number,
  i: number,
  landGapMs: number,
  layout: FaceLayout,
): CSSProperties {
  // ring −1: the needle's own badge, riding partway along it (clear of the faces on the rim).
  const radius = ring < 0 ? BOX.face * 0.58 : (layout.radii[ring] ?? layout.radii[0]);
  return {
    '--arm': `${(radius / BOX.w) * 100}%`,
    '--deg': `${-posToDeg(pos)}deg`,
    '--i': i,
    '--gap': `${landGapMs}ms`,
  } as CSSProperties;
}

export function Dial(props: DialProps): JSX.Element {
  const { left, right, target, bands, open, swing = false, markers = [], landing = false } = props;
  const { needle = null, needleSettles = false, needleBadge, showPoints = false } = props;
  const { entrance = false, landGapMs = 90, className, label } = props;
  const boxRef = useRef<HTMLDivElement>(null);
  const layout = faceLayout(useBoxPx(boxRef));
  // Live huddle faces glide at their true spots; the reveal fans a crowd out along the rim.
  const slots = landing
    ? fanOut(
        markers.map((m) => m.pos),
        layout.gap,
        layout.gap * 1.9,
        layout.edges,
      )
    : markers.map((m) => ({ at: m.pos, ring: 0 }));
  const leaders = landing
    ? markers.flatMap((m, i) => {
        const slot = slots[i] ?? { at: m.pos, ring: 0 };
        if (slot.ring === 0 && Math.abs(slot.at - m.pos) < 0.6) return [];
        const a = pointAt(m.pos, BOX.rim + 2);
        const b = pointAt(slot.at, (layout.radii[slot.ring] ?? layout.radii[0]) - 20);
        return [{ id: m.id, a, b }];
      })
    : [];
  return (
    <div
      className={`${styles.wrap} ${entrance ? styles.entrance : ''} ${className ?? ''}`}
      role="img"
      aria-label={label ?? `${left} — ${right}`}
    >
      <span className={`${styles.end} ${styles.endLeft}`}>{`◀${NBSP}${left}`}</span>
      <div ref={boxRef} className={styles.box}>
        {/* The still parts are one SVG, painted once; everything that moves is its own layer. */}
        <svg className={styles.svg} viewBox={`0 0 ${BOX.w} ${BOX.h}`} aria-hidden>
          <path d={slicePath(0, 100, BOX.rim)} className={styles.bezel} />
          <path d={slicePath(0, 100, BOX.face)} className={styles.face} />
          {target !== null && (open || swing) ? (
            <g className={styles.wedges}>
              {wedges(target, bands).map((w) => (
                <path
                  key={`${w.from}-${w.pts}`}
                  d={slicePath(w.from, w.to, BOX.face)}
                  className={ZONE_CLASS[w.pts]}
                />
              ))}
              {wedges(target, bands).map((w) => {
                if (w.label === null) return null;
                const p = pointAt(w.label, BOX.face * 0.8);
                return (
                  <text
                    key={`t${w.from}`}
                    x={f(p.x)}
                    y={f(p.y)}
                    className={`${styles.zoneText} ${w.pts === 4 ? styles.zoneText4 : ''}`}
                  >
                    {w.pts}
                  </text>
                );
              })}
            </g>
          ) : null}
          {TICKS.map((pos) => {
            const a = pointAt(pos, BOX.face + 6);
            const b = pointAt(pos, BOX.face + (pos % 10 === 0 ? 26 : 16));
            return (
              <line
                key={pos}
                x1={f(a.x)}
                y1={f(a.y)}
                x2={f(b.x)}
                y2={f(b.y)}
                className={styles.tick}
              />
            );
          })}
        </svg>
        {/* The reveal's hold is never still: once the faces are down, the bullseye's outline
            breathes (its own layer, opacity only) until the stage moves on. */}
        {swing && target !== null ? (
          <svg
            className={`${styles.svg} ${styles.halo}`}
            viewBox={`0 0 ${BOX.w} ${BOX.h}`}
            aria-hidden
          >
            {wedges(target, bands)
              .filter((w) => w.pts === 4)
              .map((w) => (
                <path key={w.from} d={slicePath(w.from, w.to, BOX.face)} />
              ))}
          </svg>
        ) : null}
        {!open || swing ? <Shutter swing={swing} /> : null}
        {leaders.length > 0 ? (
          <svg
            className={`${styles.svg} ${styles.leaders}`}
            viewBox={`0 0 ${BOX.w} ${BOX.h}`}
            aria-hidden
          >
            {leaders.map(({ id, a, b }) => (
              <line
                key={id}
                x1={f(a.x)}
                y1={f(a.y)}
                x2={f(b.x)}
                y2={f(b.y)}
                className={styles.leader}
              />
            ))}
          </svg>
        ) : null}
        {needle !== null ? (
          <span
            className={`${styles.needle} ${needleSettles ? styles.settle : ''}`}
            style={{ '--deg': `${-posToDeg(needle)}deg` } as CSSProperties}
            aria-hidden
          />
        ) : null}
        <span className={styles.hub} aria-hidden />
        {needle !== null && needleBadge ? (
          <span className={styles.arm} style={faceStyle(needle, -1, 0, landGapMs, layout)}>
            <span className={styles.upright}>
              <span className={`${styles.badge} ${styles.needleBadge}`}>{needleBadge}</span>
            </span>
          </span>
        ) : null}
        {markers.map((m, i) => (
          <span
            key={m.id}
            className={`${styles.arm} ${landing ? '' : styles.glide}`}
            style={faceStyle(slots[i]?.at ?? m.pos, slots[i]?.ring ?? 0, i, landGapMs, layout)}
          >
            <span className={`${styles.upright} ${landing ? '' : styles.glide}`}>
              <span className={landing ? styles.land : styles.face40}>
                {/* A face that scored hops while the points are up, the crowd in a ripple. */}
                <span
                  className={`${styles.bob} ${showPoints && (m.pts ?? 0) > 0 ? styles.hop : ''}`}
                >
                  <Avatar avatarId={m.avatarId} size={40} />
                  {showPoints && m.pts !== null && m.pts !== undefined ? (
                    <span className={`${styles.badge} ${m.pts === 0 ? styles.badgeZero : ''}`}>
                      {m.pts > 0 ? `+${m.pts}` : '0'}
                    </span>
                  ) : null}
                </span>
              </span>
            </span>
          </span>
        ))}
      </div>
      <span className={`${styles.end} ${styles.endRight}`}>{`${right}${NBSP}▶`}</span>
    </div>
  );
}

/** The lid: its own layer (a rotating HTML box holding a half disc), clipped at the baseline, so
 *  the swing is composited instead of repainting the dial every frame. */
function Shutter({ swing }: { swing: boolean }): JSX.Element {
  return (
    <span className={styles.shutterClip} aria-hidden>
      <span className={`${styles.shutter} ${swing ? styles.swing : ''}`}>
        <svg className={styles.svg} viewBox={`0 0 ${BOX.w} ${BOX.h}`}>
          <path d={slicePath(0, 100, BOX.face + 2)} className={styles.shutterFace} />
          <path d={slicePath(0, 100, BOX.face * 0.34)} className={styles.shutterHub} />
          {[0.5, 0.64, 0.78, 0.92].map((k) => (
            <path
              key={k}
              d={`M ${f(BOX.cx - BOX.face * k)} ${BOX.cy} A ${BOX.face * k} ${BOX.face * k} 0 0 1 ${f(BOX.cx + BOX.face * k)} ${BOX.cy}`}
              className={styles.grille}
            />
          ))}
        </svg>
      </span>
      {/* A closed lid is never still: a faint glint sweeps it, a radio searching for a station. */}
      {swing ? null : <span className={styles.glint} />}
    </span>
  );
}
