// The reveal's face row, laid out in TV pixels (the TV is a fixed 1920 × 1080 design the shell
// scales, DESIGN_SYSTEM principle 1): one row up to 8 players, two above. Each guess becomes a small
// face that flies from the guesser's own tile to a slot in the stack under the face they picked,
// so the geometry is computed here — the flight's start is "where the guesser sits".

export interface FaceLayout {
  rows: number;
  perRow: number;
  tileW: number;
  avatar: number;
  nameH: number;
  mini: number;
  /** Minis per stack row, and the stack rows shown before "+n". */
  perStack: number;
  stackRows: number;
  rowH: number;
  width: number;
  height: number;
}

const ROW_WIDTH = 1680;
const GAP = 4;

export function faceLayout(n: number): FaceLayout {
  const rows = n > 8 ? 2 : 1;
  const perRow = Math.max(1, Math.ceil(n / rows));
  const tileW = Math.min(230, Math.floor(ROW_WIDTH / perRow));
  const avatar = rows === 2 ? Math.min(72, Math.round(tileW * 0.4)) : Math.min(128, Math.round(tileW * 0.56)); // prettier-ignore
  const mini = rows === 2 ? 30 : 44;
  const nameH = rows === 2 ? 34 : 48;
  const perStack = Math.max(1, Math.floor((tileW - 12) / (mini + GAP)));
  const stackRows = 2;
  const rowH = avatar + nameH + stackRows * (mini + GAP) + (rows === 2 ? 12 : 20);
  return { rows, perRow, tileW, avatar, nameH, mini, perStack, stackRows, rowH, width: perRow * tileW, height: rows * rowH }; // prettier-ignore
}

/** Tile i's left edge and top, inside the row box (a short last row is centred). */
export function tileAt(i: number, n: number, l: FaceLayout): { x: number; y: number } {
  const row = Math.floor(i / l.perRow);
  const inRow = row === l.rows - 1 ? n - row * l.perRow : l.perRow;
  const offset = ((l.perRow - inRow) * l.tileW) / 2;
  return { x: offset + (i - row * l.perRow) * l.tileW, y: row * l.rowH };
}

/** The centre of tile i's avatar. */
export function avatarCentre(i: number, n: number, l: FaceLayout): { x: number; y: number } {
  const t = tileAt(i, n, l);
  return { x: t.x + l.tileW / 2, y: t.y + l.avatar / 2 };
}

/** The centre of slot s of the stack under tile i, holding `count` minis (null past the shown
 *  rows: those fold into "+n"). Each stack row is centred on what it holds. */
export function slotCentre(
  i: number,
  s: number,
  count: number,
  n: number,
  l: FaceLayout,
): { x: number; y: number } | null {
  if (s >= l.perStack * l.stackRows) return null;
  const t = tileAt(i, n, l);
  const row = Math.floor(s / l.perStack);
  const col = s % l.perStack;
  const inRow = Math.max(1, Math.min(l.perStack, count - row * l.perStack));
  const rowW = inRow * (l.mini + GAP) - GAP;
  const left = t.x + (l.tileW - rowW) / 2;
  return {
    x: left + col * (l.mini + GAP) + l.mini / 2,
    y: t.y + l.avatar + l.nameH + row * (l.mini + GAP) + l.mini / 2,
  };
}
