// Line-drawing primitives for the bot's shapes (shapes-catalog.ts): every helper returns one stroke
// as a flat [x, y, x, y, …] list on the 256×256 canvas.
export type Points = number[];
export type Shape = Points[];

export const C = 128; // canvas centre

export function circle(cx: number, cy: number, r: number, n = 24): Points {
  const p: Points = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    p.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return p;
}

export function arc(cx: number, cy: number, r: number, from: number, to: number, n = 12): Points {
  const p: Points = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    p.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return p;
}

export function poly(...xy: number[]): Points {
  return [...xy, xy[0] as number, xy[1] as number];
}

export function line(...xy: number[]): Points {
  return xy;
}

export function star(cx: number, cy: number, outer: number, inner: number): Points {
  const p: Points = [];
  for (let i = 0; i <= 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    p.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return p;
}

export function wave(x0: number, x1: number, y: number, amp: number, periods: number): Points {
  const p: Points = [];
  const n = periods * 8;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    p.push(x, y + Math.sin((i / n) * periods * Math.PI * 2) * amp);
  }
  return p;
}
