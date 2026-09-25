// meter. Strokes are kept locally until "Done" encodes them into the wire format. Pointer events
// cover finger, mouse and pen. While the VIP pauses, the shell freezes the pad (the phone's <main>
// goes inert) and the deadline is shifted on resume, so no drawing time is lost.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX, PointerEvent as ReactPointerEvent } from 'react';
import { CANVAS, INK_CHARS, MAX_STROKES, encodePoints, inkCost } from '../server/encoding';
import type { Stroke } from '../server/types';
import { usePadStyle, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import { PALETTE, WIDTHS, decodeStroke, paint } from './drawing';
import type { DecodedStroke } from './drawing';
import styles from './DrawPad.module.css';
import { STRINGS } from './strings';

/** The swatches' names for a screen reader, in PALETTE order (server/palette.ts PALETTE_NAMES),
 *  in the phone's language. */
function colourNames(L: Translator): string[] {
  return [
    L('ink'),
    L('red'),
    L('blue'),
    L('green'),
    L('yellow'),
    L('orange'),
    L('purple'),
    L('brown'),
  ];
}

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
  /** I-496 A: a quiet line inside the empty sheet (the game's rule), gone with the first stroke. */
  hint?: string;
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

export function DrawPad({ onChange, onProgress, initial, disabled, hint }: DrawPadProps): JSX.Element {
  const L = useT(STRINGS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // I-021: this phone's paper and pencil (the settings sheet); the pad repaints when they change.
  const pad = usePadStyle();
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
      // Upright, a 180 px floor holds (pass 859: a 320 × 568 phone squeezed the sheet to 115 px;
      // at 180 the ink row and Undo still sit above the sticky button there).
      const sideways = window.matchMedia('(orientation: landscape)').matches;
      const floor = sideways ? Math.min(220, box.clientHeight || 220) : 180;
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
    paint(ctx, current.current ? [...strokes, current.current] : strokes, size, pad);
  }, [strokes, size, pad]);

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

  const colours = colourNames(L);
  const sizeNames = [L('thin'), L('medium'), L('thick')];
  // I-794 H: the sheet first and as tall as the screen allows; the colours and then one band of
  // tools (ink, pen size, Undo, Clear) under it, so nothing sinks under the footer.
  const swatches = (
    <div className={styles.tools} role="toolbar" aria-label={L('pen')}>
      <div className={styles.swatches}>
        {PALETTE.map((hex, i) => (
          <button
            key={hex}
            type="button"
            className={`${styles.swatch} ${i === color ? styles.swatchOn : ''}`}
            style={{ background: hex, '--pb-i': i } as CSSProperties}
            aria-label={colours[i]}
            aria-pressed={i === color}
            onClick={() => setColor(i)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
  return (
    <div className={styles.pad}>
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
          aria-label={L('drawing sheet')}
        />
        {hint && strokes.length === 0 && livePoints === 0 ? (
          <span className={styles.hint} style={{ width: size, height: size }} aria-hidden>
            {hint}
          </span>
        ) : null}
      </div>
      {swatches}
      <div className={styles.bottom}>
        <div
          className={styles.ink}
          aria-label={L('ink {pct} percent left', {
            pct: Math.round((1 - ink / INK_CHARS) * 100),
          })}
        >
          <span
            className={`${styles.inkFill} ${outOfInk ? styles.inkOut : ''}`}
            style={{ width: `${Math.max(0, 100 - (ink / INK_CHARS) * 100)}%` }}
          />
        </div>
        {/* The meter is a thin line under the colours; its words show only when they matter. */}
        {outOfInk || tooMany ? (
          <span className={styles.inkLabel} role="status">
            {outOfInk ? L('Out of ink — undo to get some back') : L('Too many strokes')}
          </span>
        ) : null}
        {/* Pen sizes share the band with Undo and Clear (review-loop #9, I-794 H). */}
        <div className={styles.sizes}>
          {WIDTHS.map((w, i) => (
            <button
              key={w}
              type="button"
              className={`${styles.size} ${i === width ? styles.sizeOn : ''}`}
              aria-label={sizeNames[i]}
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
          {L('↶ Undo')}
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={() => commit([])}
          disabled={disabled || strokes.length === 0}
        >
          {L('Clear')}
        </button>
      </div>
    </div>
  );
}
