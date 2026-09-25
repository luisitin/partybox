// Pure geometry for the Dial (P00 §6): positions 0–100 on a semicircle, the target's scoring
// wedges clipped at both ends, and the throttle a huddle drag sends through. No React, no DOM.

/** The dial's drawing box (SVG viewBox units): the pivot sits low, the face is a half disc. */
export const BOX = { w: 1000, h: 560, cx: 500, cy: 520, face: 430, rim: 462 } as const;

/** 0 → the left end (180°), 100 → the right end (0°); degrees, counter-clockwise from the right. */
export function posToDeg(pos: number): number {
  return 180 - (Math.min(100, Math.max(0, pos)) * 180) / 100;
}

export function pointAt(pos: number, radius: number): { x: number; y: number } {
  const rad = (posToDeg(pos) * Math.PI) / 180;
  return { x: BOX.cx + radius * Math.cos(rad), y: BOX.cy - radius * Math.sin(rad) };
}

/** A pie slice from the pivot between two positions (from < to), as an SVG path. */
export function slicePath(from: number, to: number, radius: number): string {
  const a = pointAt(from, radius);
  const b = pointAt(to, radius);
  const large = Math.abs(to - from) > 100 ? 1 : 0;
  const f = (n: number): string => n.toFixed(2);
  return `M ${BOX.cx} ${BOX.cy} L ${f(a.x)} ${f(a.y)} A ${radius} ${radius} 0 ${large} 1 ${f(b.x)} ${f(b.y)} Z`;
}

export interface Wedge {
  from: number;
  to: number;
  pts: 2 | 3 | 4;
  /** Where the number sits (the wedge's middle), or null when the wedge is too thin to print. */
  label: number | null;
}

/** The five wedges 2 · 3 · 4 · 3 · 2 around `target`, clipped at 0 and 100 (spec §5.5). `bands`
 *  are the 4 / 3 / 2 edges (normal: 5, 10, 15). A wedge clipped to nothing is dropped. */
export function wedges(target: number, bands: readonly [number, number, number]): Wedge[] {
  const [four, three, two] = bands;
  const raw: { from: number; to: number; pts: 2 | 3 | 4 }[] = [
    { from: target - two, to: target - three, pts: 2 },
    { from: target - three, to: target - four, pts: 3 },
    { from: target - four, to: target + four, pts: 4 },
    { from: target + four, to: target + three, pts: 3 },
    { from: target + three, to: target + two, pts: 2 },
  ];
  return raw
    .map((w) => ({ ...w, from: Math.max(0, w.from), to: Math.min(100, w.to) }))
    .filter((w) => w.to - w.from > 0.01)
    .map((w) => ({ ...w, label: w.to - w.from >= 2.5 ? (w.from + w.to) / 2 : null }));
}

export interface FanSlot {
  /** Where the face is drawn (0–100), as close to its true spot as the others allow. */
  at: number;
  /** 0 on the rim; 1, 2 further out when a cluster is too big to spread along it. */
  ring: number;
}

/** Spreads one ring's positions at least `gap` apart, each cluster centred on its true spots,
 *  inside 0–100. Returns the drawn positions in the input order. */
function spread(pos: readonly number[], gap: number, lo = 0, hi = 100): number[] {
  const order = pos.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p || a.i - b.i);
  const d = order.map((o) => o.p);
  for (let pass = 0; pass < 3; pass += 1) {
    for (let k = 1; k < d.length; k += 1)
      d[k] = Math.max(d[k] as number, (d[k - 1] as number) + gap);
    let start = 0;
    for (let k = 1; k <= d.length; k += 1) {
      if (k < d.length && (d[k] as number) - (d[k - 1] as number) <= gap + 1e-6) continue;
      let shift = 0;
      for (let j = start; j < k; j += 1) shift += (d[j] as number) - (order[j] as { p: number }).p;
      shift /= k - start;
      for (let j = start; j < k; j += 1) d[j] = (d[j] as number) - shift;
      start = k;
    }
    for (let k = d.length - 1; k >= 0; k -= 1)
      d[k] = Math.min(d[k] as number, k === d.length - 1 ? hi : (d[k + 1] as number) - gap);
    for (let k = 0; k < d.length; k += 1)
      d[k] = Math.max(d[k] as number, k === 0 ? lo : (d[k - 1] as number) + gap);
  }
  const out = new Array<number>(pos.length);
  order.forEach((o, k) => {
    out[o.i] = d[k] as number;
  });
  return out;
}

/** How far from either end each ring's faces may sit. An outer ring stands further off the rim,
 *  so at the bottom of the arc it would reach past the dial into the end labels at its feet
 *  (p09: a crowd at "Nightmare fuel" covered the label); its faces rise to here instead, and the
 *  leader lines point at their true spots. */
export const FAN_EDGES = [4, 14, 20] as const;

/** The reveal's faces (spec §5.5 "faces stack outwards where they overlap"): spread along the
 *  rim `gap` apart; a face that would drift more than `maxShift` from its true spot moves out a
 *  ring (every other face of a crowd), up to three rings; each ring keeps `edges[ring]` from the
 *  ends. */
export function fanOut(
  pos: readonly number[],
  gap = 3.2,
  maxShift = 6,
  edges: readonly number[] = FAN_EDGES,
): FanSlot[] {
  const slots: FanSlot[] = pos.map((p) => ({ at: p, ring: 0 }));
  let pending = pos.map((_, i) => i);
  for (let ring = 0; ring < 3 && pending.length > 0; ring += 1) {
    const last = ring === 2;
    const lo = edges[ring] ?? 0;
    const home = (i: number): number => Math.min(100 - lo, Math.max(lo, pos[i] as number));
    const at = spread(pending.map(home), gap * (1 - ring * 0.08), lo, 100 - lo);
    const far = pending.filter(
      (_, k) => Math.abs((at[k] as number) - home(pending[k] as number)) > maxShift,
    );
    if (far.length === 0 || last) {
      pending.forEach((i, k) => (slots[i] = { at: at[k] as number, ring }));
      break;
    }
    // A crowd: keep every other face (by true spot) on this ring, send the rest one ring out.
    const sorted = [...pending].sort((a, b) => (pos[a] as number) - (pos[b] as number) || a - b);
    const stay = sorted.filter((_, k) => k % 2 === 0);
    const keep = spread(stay.map(home), gap * (1 - ring * 0.08), lo, 100 - lo);
    stay.forEach((i, k) => (slots[i] = { at: keep[k] as number, ring }));
    pending = sorted.filter((_, k) => k % 2 === 1);
  }
  return slots;
}

/** Where the reveal's faces ride for a dial drawn `boxPx` wide. Faces are a fixed `facePx`, so on
 *  a smaller dial (a 720p TV, the phone stage) a fixed spacing in dial units packed them onto one
 *  another; here the spacing along the rim, the distance between rings and each ring's clearance
 *  from the ends (a face never reaches past the dial into the end labels at its feet) all follow
 *  the drawn size. Unmeasured (`boxPx` 0) reads as a 1080p TV. */
export interface FaceLayout {
  /** Along the rim, in dial positions. */
  gap: number;
  /** Each ring's distance from the pivot, in box units. */
  radii: readonly [number, number, number];
  /** Each ring's clearance from both ends, in dial positions. */
  edges: readonly [number, number, number];
}

export function faceLayout(boxPx: number, facePx = 40): FaceLayout {
  const unitPx = boxPx > 0 ? boxPx / BOX.w : 0.9;
  const face = (facePx + 6) / unitPx;
  const r0 = BOX.rim + Math.max(34, (facePx / 2 + 6) / unitPx);
  const step = Math.max(46, face);
  const radii = [r0, r0 + step, r0 + 2 * step] as const;
  const deg = 180 / Math.PI;
  const edge = (r: number): number => (Math.acos(Math.min(1, BOX.w / 2 / r)) * deg) / 1.8;
  return {
    gap: Math.max(3.2, ((face / r0) * deg) / 1.8),
    radii,
    edges: [edge(radii[0]), edge(radii[1]), edge(radii[2])],
  };
}

/** Markers that sit within `gap` of an earlier one stack one ring further out (spec §5.5). */
export function stackRings(positions: readonly number[], gap = 4): number[] {
  const rings: number[] = [];
  positions.forEach((pos, i) => {
    let ring = 0;
    for (let j = 0; j < i; j += 1)
      if (Math.abs((positions[j] as number) - pos) < gap && rings[j] === ring) ring += 1;
    rings.push(ring);
  });
  return rings;
}

/** Where a pointer at `x` lands on a track from `left` to `left + width`, as 0–100. */
export function posFromX(x: number, left: number, width: number): number {
  if (width <= 0) return 50;
  return Math.round(Math.min(100, Math.max(0, ((x - left) / width) * 100)));
}

/**
 * A leading-edge throttle for a drag (spec §5.9): at most one value per `intervalMs`, the latest
 * value delivered at the end of each window, and `flush` sends what is pending on release.
 * `now` and `schedule` are injected so tests drive it without timers.
 */
export function createThrottle(
  intervalMs: number,
  send: (value: number) => void,
  now: () => number,
  schedule: (fn: () => void, ms: number) => () => void,
): { push: (value: number) => void; flush: () => void; cancel: () => void } {
  let last = -Infinity;
  let pending: number | null = null;
  let sent: number | null = null;
  let cancelTimer: (() => void) | null = null;
  const fire = (): void => {
    cancelTimer = null;
    if (pending === null) return;
    last = now();
    sent = pending;
    send(pending);
    pending = null;
  };
  return {
    push(value) {
      pending = value;
      const wait = last + intervalMs - now();
      if (wait <= 0) fire();
      else if (!cancelTimer) cancelTimer = schedule(fire, wait);
    },
    flush() {
      cancelTimer?.();
      cancelTimer = null;
      if (pending !== null && pending !== sent) fire();
      pending = null;
    },
    cancel() {
      cancelTimer?.();
      cancelTimer = null;
      pending = null;
    },
  };
}
