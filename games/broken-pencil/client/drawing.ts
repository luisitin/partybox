// Shared drawing vocabulary for the DrawPad (phone) and DrawingView (TV + phone): the palette,
// pen widths, and decoding of the wire format (../server/encoding is pure and browser-safe).
import { CANVAS, decodePoints } from '../server/encoding';
import type { Drawing, Stroke } from '../server/types';

export { CANVAS };

export { PALETTE, PALETTE_NAMES, PAPER, WIDTHS } from '../server/palette';
import { PALETTE, PAPER, WIDTHS } from '../server/palette';

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
