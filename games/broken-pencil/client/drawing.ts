// Shared drawing vocabulary for the DrawPad (phone) and DrawingView (TV + phone): the palette,
// pen widths, and decoding of the wire format (../server/encoding is pure and browser-safe).
import { CANVAS, decodePoints } from '../server/encoding';
import type { Drawing, Stroke } from '../server/types';

export { CANVAS };

/** Ink colours 0..7. Paper is warm white on every theme so the drawing reads like a drawing. */
export const PALETTE = [
  '#1b1b2f',
  '#e63946',
  '#1d6fe0',
  '#2a9d8f',
  '#e9c40b',
  '#f77f00',
  '#8338ec',
  '#8d5524',
] as const;
export const PALETTE_NAMES = ['ink', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown'];
export const PAPER = '#fffdf5';
/** Pen widths 0..2 in canvas units (out of 256). */
export const WIDTHS = [2.5, 6, 12] as const;

export interface DecodedStroke {
  color: string;
  width: number;
  /** [x0, y0, x1, y1, …] in canvas units. */
  points: number[];
}

export function decodeStroke(stroke: Stroke): DecodedStroke {
  return {
    color: PALETTE[stroke.c] ?? PALETTE[0],
    width: WIDTHS[stroke.w] ?? WIDTHS[1],
    points: decodePoints(stroke.p),
  };
}

export function decodeDrawing(drawing: Drawing | null): DecodedStroke[] {
  return drawing ? drawing.strokes.map(decodeStroke) : [];
}

/** Paints decoded strokes on a 2D context scaled so `size` px = CANVAS units. */
export function paint(ctx: CanvasRenderingContext2D, strokes: DecodedStroke[], size: number): void {
  const k = size / CANVAS;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, size, size);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const s of strokes) {
    if (s.points.length < 2) continue;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width * k;
    ctx.beginPath();
    ctx.moveTo((s.points[0] as number) * k, (s.points[1] as number) * k);
    if (s.points.length === 2)
      ctx.lineTo((s.points[0] as number) * k + 0.01, (s.points[1] as number) * k);
    for (let i = 2; i < s.points.length; i += 2)
      ctx.lineTo((s.points[i] as number) * k, (s.points[i + 1] as number) * k);
    ctx.stroke();
  }
}
