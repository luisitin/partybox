// The dial's geometry and the huddle throttle (Tune In §5.9, §5.18 "Throttle").
import { describe, expect, it } from 'vitest';
import { createThrottle, posFromX, posToDeg, stackRings, wedges } from './geometry';

describe('positions', () => {
  it('maps 0 to the left end, 50 straight up, 100 to the right end', () => {
    expect(posToDeg(0)).toBe(180);
    expect(posToDeg(50)).toBe(90);
    expect(posToDeg(100)).toBe(0);
    expect(posToDeg(140)).toBe(0);
  });
  it('reads a pointer on a track as 0–100, clamped', () => {
    expect(posFromX(10, 10, 200)).toBe(0);
    expect(posFromX(110, 10, 200)).toBe(50);
    expect(posFromX(400, 10, 200)).toBe(100);
    expect(posFromX(5, 10, 0)).toBe(50);
  });
});

describe('wedges', () => {
  it('reads 2 · 3 · 4 · 3 · 2 around the target', () => {
    expect(wedges(50, [5, 10, 15]).map((w) => [w.from, w.to, w.pts])).toEqual([
      [35, 40, 2],
      [40, 45, 3],
      [45, 55, 4],
      [55, 60, 3],
      [60, 65, 2],
    ]);
  });
  it('clips at the ends of the dial and drops what is left of nothing', () => {
    const w = wedges(2, [5, 10, 15]);
    expect(w.map((x) => [x.from, x.to, x.pts])).toEqual([
      [0, 7, 4],
      [7, 12, 3],
      [12, 17, 2],
    ]);
  });
  it('leaves a sliver unlabelled so its number never spills', () => {
    const w = wedges(99, [5, 10, 15]);
    expect(w.find((x) => x.pts === 4)?.label).not.toBeNull();
    expect(wedges(100, [4, 8, 12]).every((x) => x.to <= 100)).toBe(true);
  });
});

describe('stacking', () => {
  it('pushes a face that lands on another one ring out', () => {
    expect(stackRings([50, 51, 52, 80])).toEqual([0, 1, 2, 0]);
    expect(stackRings([10, 30])).toEqual([0, 0]);
  });
});

describe('the huddle throttle', () => {
  function rig(): {
    sent: number[];
    tick: (ms: number) => void;
    push: (v: number) => void;
    flush: () => void;
  } {
    let clock = 0;
    const timers: { at: number; fn: () => void }[] = [];
    const sent: number[] = [];
    const t = createThrottle(
      334,
      (v) => sent.push(v),
      () => clock,
      (fn, ms) => {
        const timer = { at: clock + ms, fn };
        timers.push(timer);
        return () => timers.splice(timers.indexOf(timer), 1);
      },
    );
    const tick = (ms: number): void => {
      clock += ms;
      for (const timer of [...timers].sort((a, b) => a.at - b.at))
        if (timer.at <= clock) {
          timers.splice(timers.indexOf(timer), 1);
          timer.fn();
        }
    };
    return { sent, tick, push: t.push, flush: t.flush };
  }

  it('a two-second drag at 60 moves a second sends at most 3 dials per second, plus release', () => {
    const r = rig();
    for (let i = 0; i < 120; i += 1) {
      r.push(i % 101);
      r.tick(1000 / 60);
    }
    const duringDrag = r.sent.length;
    expect(duringDrag).toBeLessThanOrEqual(7);
    r.push(64);
    r.flush();
    expect(r.sent.at(-1)).toBe(64);
    expect(r.sent.length).toBeLessThanOrEqual(duringDrag + 1);
  });

  it('release sends nothing new when the last value already went out', () => {
    const r = rig();
    r.push(10);
    expect(r.sent).toEqual([10]);
    r.flush();
    expect(r.sent).toEqual([10]);
  });
});
