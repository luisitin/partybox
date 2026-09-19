// The drawing palette, shared by the phone pad, the TV view and the server's SVG recap: ink
// colours 0..7, pen widths 0..2 (canvas units out of 256) and the warm-white paper.
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
export const WIDTHS = [2.5, 6, 12] as const;
