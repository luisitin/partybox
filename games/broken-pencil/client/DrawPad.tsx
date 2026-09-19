// meter. Strokes are kept locally until "Done" encodes them into the wire format. Pointer events
// cover finger, mouse and pen. While the VIP pauses, the shell freezes the pad (the phone's <main>
// goes inert) and the deadline is shifted on resume, so no drawing time is lost.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { JSX, PointerEvent as ReactPointerEvent } from 'react';
import { CANVAS, INK_CHARS, MAX_STROKES, encodePoints, inkCost } from '../server/encoding';
import type { Stroke } from '../server/types';
import { PALETTE, PALETTE_NAMES, WIDTHS, decodeStroke, paint } from './drawing';
import type { DecodedStroke } from './drawing';
import styles from './DrawPad.module.css';

export interface DrawPadProps {
  /** Encoded strokes, ready for `send({ type: 'draw', strokes })`. */
  onChange?: (strokes: Stroke[]) => void;
  /**
   * The sheet including the stroke under the finger, on every move — the draft the deadline keeps
   * (a stroke still being drawn at the buzzer stops where it is, like everything else).
   */
  onProgress?: (strokes: Stroke[]) => void;
  /** Strokes to start from: the draft the server kept when this phone reloaded mid-drawing. */
  initial?: readonly Stroke[];
  disabled?: boolean;
}

interface Live extends DecodedStroke {
  c: number;
  w: number;
}

/** Points closer than this (canvas units) to the previous one are dropped — ink is finite. */
const MIN_STEP = 2;

function encode(strokes: Live[]): Stroke[] {
  return strokes.map((s) => ({ c: s.c, w: s.w, p: encodePoints(s.points) }));
}

function decode(strokes: readonly Stroke[]): Live[] {
  return strokes.map((s) => ({ c: s.c, w: s.w, ...decodeStroke(s) }));
}

function inkUsed(strokes: Live[], current: Live | null): number {
  let total = 0;
  for (const s of strokes) total += inkCost(s.points.length / 2);
  if (current) total += inkCost(current.points.length / 2);
  return total;
}

export function DrawPad({ onChange, onProgress, initial, disabled }: DrawPadProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // `initial` is read once: later pushes carry this pad's own drafts back and must not reset it.
  const [strokes, setStrokes] = useState<Live[]>(() => (initial ? decode(initial) : []));
  const [color, setColor] = useState(0);
  const [width, setWidth] = useState(1);
  const current = useRef<Live | null>(null);
  const [size, setSize] = useState(300);
  // Point count of the stroke being drawn (state, so the meter re-renders without reading the ref).
  const [livePoints, setLivePoints] = useState(0);

  // Fit the sheet to its box (square), crisp on retina — before the first paint, so the sheet is
  // never drawn at a placeholder size and then re-laid out (review-loop #18).
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    // Never taller than the space left above the sticky footer (review-loop #9): on an iPhone 15
    // a full-width square hid its bottom third under the button. Floor 220 px, then the body scrolls.
    const measure = (): void => {
      // A sideways phone in Safari leaves the box under 220 px tall: the floor is the box then.
      const floor = Math.min(220, box.clientHeight || 220);
      setSize(Math.max(floor, Math.floor(Math.min(box.clientWidth, box.clientHeight || Infinity))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const repaint = useCallback((): void => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(ctx, current.current ? [...strokes, current.current] : strokes, size);
  }, [strokes, size]);

  useEffect(repaint, [repaint]);

  const commit = useCallback(
    (next: Live[]): void => {
      setStrokes(next);
      onChange?.(encode(next));
    },
    [onChange],
  );

  const toPoint = (e: ReactPointerEvent): [number, number] => {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS;
    return [Math.max(0, Math.min(255, Math.round(x))), Math.max(0, Math.min(255, Math.round(y)))];
  };

  const ink = inkUsed(strokes, null) + (livePoints > 0 ? inkCost(livePoints) : 0);
  const outOfInk = ink >= INK_CHARS;
  const tooMany = strokes.length >= MAX_STROKES;

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (disabled || outOfInk || tooMany || current.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = toPoint(e);
    current.current = {
      c: color,
      w: width,
      color: PALETTE[color] ?? PALETTE[0],
      width: WIDTHS[width] ?? WIDTHS[1],
      points: [x, y],
    };
    setLivePoints(1);
    repaint();
  };

  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    const live = current.current;
    if (!live) return;
    const [x, y] = toPoint(e);
    const n = live.points.length;
    const lx = live.points[n - 2] as number;
    const ly = live.points[n - 1] as number;
    if (Math.hypot(x - lx, y - ly) < MIN_STEP) return;
    // The meter counts committed ink plus this stroke; stop adding points at the cap.
    if (inkUsed(strokes, live) + inkCost(1) > INK_CHARS) return;
    live.points.push(x, y);
    repaint();
    setLivePoints(live.points.length / 2);
    onProgress?.(encode([...strokes, live]));
  };

  const onUp = (): void => {
    const live = current.current;
    if (!live) return;
    current.current = null;
    setLivePoints(0);
    commit([...strokes, live]);
  };

  return (
    <div className={styles.pad}>
      <div className={styles.tools} role="toolbar" aria-label="pen">
        <div className={styles.swatches}>
          {PALETTE.map((hex, i) => (
            <button
              key={hex}
              type="button"
              className={`${styles.swatch} ${i === color ? styles.swatchOn : ''}`}
              style={{ background: hex }}
              aria-label={PALETTE_NAMES[i]}
              aria-pressed={i === color}
              onClick={() => setColor(i)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
      <div ref={boxRef} className={styles.box}>
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${disabled ? styles.canvasOff : ''}`}
          style={{ width: size, height: size }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
          aria-label="drawing sheet"
        />
      </div>
      <div className={styles.bottom}>
        <div
          className={styles.ink}
          aria-label={`ink ${Math.round((1 - ink / INK_CHARS) * 100)} percent left`}
        >
          <span
            className={`${styles.inkFill} ${outOfInk ? styles.inkOut : ''}`}
            style={{ width: `${Math.max(0, 100 - (ink / INK_CHARS) * 100)}%` }}
          />
        </div>
        <span className={styles.inkLabel}>
          {outOfInk ? 'Out of ink — undo to get some back' : tooMany ? 'Too many strokes' : 'ink'}
        </span>
        {/* Pen sizes live down here so the colour row is a single line and the sheet gets the
            height back (review-loop #9). */}
        <div className={styles.sizes}>
          {WIDTHS.map((w, i) => (
            <button
              key={w}
              type="button"
              className={`${styles.size} ${i === width ? styles.sizeOn : ''}`}
              aria-label={['thin', 'medium', 'thick'][i]}
              aria-pressed={i === width}
              onClick={() => setWidth(i)}
              disabled={disabled}
            >
              <span style={{ width: 6 + i * 8, height: 6 + i * 8 }} />
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.tool}
          onClick={() => commit(strokes.slice(0, -1))}
          disabled={disabled || strokes.length === 0}
        >
          ↶ Undo
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={() => commit([])}
          disabled={disabled || strokes.length === 0}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
