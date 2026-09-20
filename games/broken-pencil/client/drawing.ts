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
  // I-021 A: paper — faint ruled lines every 27 units and a red margin, under the strokes. Only
  // the phone's pad paints through here; the TV renders the same strokes as SVG on plain paper.
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(80, 110, 170, 0.18)';
  for (let y = 27 * k; y < size; y += 27 * k) {
    ctx.beginPath();
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(size, Math.round(y) + 0.5);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(214, 88, 88, 0.45)';
  ctx.beginPath();
  ctx.moveTo(Math.round(34 * k) + 0.5, 0);
  ctx.lineTo(Math.round(34 * k) + 0.5, size);
  ctx.stroke();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const s of strokes) {
    if (s.points.length < 2) continue;
    // I-021 B: a pencil, not a pen — a soft wide pass under a thinner full pass, the width easing
    // ±15 % along the path from the point index (deterministic: the stored stroke is untouched,
    // so every screen draws the same line).
    ctx.strokeStyle = s.color;
    ctx.lineCap = 'round';
    const segment = (i: number, width: number): void => {
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo((s.points[i - 2] as number) * k, (s.points[i - 1] as number) * k);
      ctx.lineTo((s.points[i] as number) * k, (s.points[i + 1] as number) * k);
      ctx.stroke();
    };
    if (s.points.length === 2) {
      ctx.lineWidth = s.width * k;
      ctx.beginPath();
      ctx.moveTo((s.points[0] as number) * k, (s.points[1] as number) * k);
      ctx.lineTo((s.points[0] as number) * k + 0.01, (s.points[1] as number) * k);
      ctx.stroke();
      continue;
    }
    for (const pass of [0.35, 1] as const) {
      ctx.globalAlpha = pass;
      for (let i = 2; i < s.points.length; i += 2) {
        const wobble = 1 + 0.15 * Math.sin(i * 1.7);
        segment(i, s.width * k * wobble * (pass === 1 ? 0.85 : 1.35));
      }
    }
    ctx.globalAlpha = 1;
  }
}
