// Stroke point encoding shared by the server (bot, validation helpers) and the client (DrawPad,
// DrawingView). A stroke's points are bytes [x0, y0, x1, y1, …] on a 256×256 canvas, base64'd.
// Table-based on purpose: no Buffer, no btoa — the same code runs in the reducer and the browser.
const TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP: Record<string, number> = Object.fromEntries([...TABLE].map((c, i) => [c, i]));

export const CANVAS = 256;
/**
 * Total base64 characters of points allowed per drawing (≈ 975 points) and the stroke cap: sized so
 * 8 books × 7 drawings at the limit stay under the 256 KB state cap (≈ 235 KB worst case).
 */
export const INK_CHARS = 2600;
export const MAX_STROKES = 64;
export const COLORS = 8;
export const WIDTHS = 3;

/** Points (x, y pairs, each 0..255) → base64. Values are clamped and rounded. */
export function encodePoints(points: readonly number[]): string {
  const bytes = points.map((v) => Math.max(0, Math.min(255, Math.round(v))));
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] as number;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    out += TABLE[(n >> 18) & 63] as string;
    out += TABLE[(n >> 12) & 63] as string;
    out += b === undefined ? '=' : (TABLE[(n >> 6) & 63] as string);
    out += c === undefined ? '=' : (TABLE[n & 63] as string);
  }
  return out;
}

/** base64 → flat [x0, y0, x1, y1, …]. Tolerant: bad characters decode as 0, odd byte dropped. */
export function decodePoints(text: string): number[] {
  const clean = text.replace(/=+$/, '');
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const chunk = [0, 1, 2, 3].map((k) => LOOKUP[clean[i + k] ?? ''] ?? 0);
    const n =
      ((chunk[0] as number) << 18) |
      ((chunk[1] as number) << 12) |
      ((chunk[2] as number) << 6) |
      (chunk[3] as number);
    const have = Math.min(4, clean.length - i);
    bytes.push((n >> 16) & 255);
    if (have > 2) bytes.push((n >> 8) & 255);
    if (have > 3) bytes.push(n & 255);
  }
  if (bytes.length % 2 === 1) bytes.pop();
  return bytes;
}

/** How many base64 characters `pointCount` points cost (what the ink meter counts). */
export function inkCost(pointCount: number): number {
  return 4 * Math.ceil((pointCount * 2) / 3);
}
