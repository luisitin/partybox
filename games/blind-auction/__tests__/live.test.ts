// Live events (LIVE-EVENTS.md): the setting puts an event in every other ordinary slot, each event
// is a fair bet whose outcome agrees with how it plays out, and the run reaches views only at open.
import { describe, expect, it } from 'vitest';
import { drawEvent } from '../server/events';
import { EVENT_MS, betsMs } from '../server/timing';
import { controllerView, tvView } from '../server/views';
import { LIVE_KINDS } from '../server/types';
import { seedRng } from '@partybox/game-sdk';
import { bet, playThrough, send, start, walkTo } from './helpers';

describe('live events: the draw', () => {
  it('off by default; on, every other ordinary box is an event and the grand box stays last', () => {
    expect(start(4, { rounds: 8 }).boxes.some((b) => b.box.event)).toBe(false);
    const s = start(4, { rounds: 8, live: true });
    const events = s.boxes.map((b) => b.box.event ?? null);
    expect(events.filter((_, i) => i % 2 === 1 && i < 7).every(Boolean)).toBe(true);
    expect(events.filter((_, i) => i % 2 === 0).every((e) => e === null)).toBe(true);
    expect(s.boxes.at(-1)?.box.grand).toBe(true);
    // Three events in 7 ordinary slots: all three kinds appear.
    expect(new Set(events.filter(Boolean)).size).toBe(3);
  });

  it('each event: chances add to 100, every option labelled and paying, outcome fits the detail', () => {
    for (const kind of LIVE_KINDS)
      for (let seed = 1; seed <= 200; seed++) {
        const [round] = drawEvent(kind, seedRng(seed), 1);
        const { box, outcome, detail = [] } = round;
        expect(
          box.options.reduce((s, o) => s + o.chance, 0),
          kind,
        ).toBe(100);
        for (const o of box.options) {
          expect(o.label?.name, kind).toBeTruthy();
          expect(o.pay, kind).toBeGreaterThan(1);
        }
        expect(outcome).toBeGreaterThanOrEqual(0);
        expect(outcome).toBeLessThan(box.options.length);
        if (kind === 'race') {
          expect(detail[0]).toBe(outcome);
          expect([...detail].sort()).toEqual([0, 1, 2, 3]);
        }
        if (kind === 'dice') {
          const [a = 0, b = 0] = detail;
          expect(a).toBeGreaterThanOrEqual(1);
          expect(b).toBeLessThanOrEqual(6);
          const sum = a + b;
          expect(outcome).toBe(sum < 7 ? 0 : sum === 7 ? 1 : 2);
        }
        if (kind === 'wheel') {
          expect(box.options.length).toBeGreaterThanOrEqual(4);
          expect(box.options.length).toBeLessThanOrEqual(6);
          expect(detail[0]).toBeGreaterThanOrEqual(10);
          expect(detail[0]).toBeLessThanOrEqual(89);
        }
      }
  });

  it('racers and prizes vary from event to event', () => {
    const casts = new Set<string>();
    // One chain of draws, as in a game (the rng moves on after every draw).
    let rng = seedRng(7);
    for (let i = 0; i < 20; i++) {
      const [round, next] = drawEvent('race', rng, i);
      rng = next;
      casts.add(round.box.options.map((o) => o.label?.name).join());
    }
    expect(casts.size).toBeGreaterThan(10);
  });
});

describe('live events: the reveal', () => {
  const liveAt = (): ReturnType<typeof start> => {
    let s = start(4, { rounds: 5, live: true });
    s = walkTo(s, 'bet');
    // The second box is the first event.
    s = walkTo(walkTo(s, 'box'), 'bet');
    expect(s.boxes[s.r.idx]?.box.event).toBeTruthy();
    return s;
  };

  it('no run in any view before open; at open step 0 the run is there, the payouts are not', () => {
    let s = liveAt();
    expect(tvView(s).run).toBeNull();
    expect(controllerView(s, 'p1').run).toBeNull();
    s = bet(s, 'p1', 0, 20);
    s = walkTo(s, 'open');
    const tv = tvView(s);
    expect(tv.step).toBe(0);
    expect(tv.run?.outcome).toBe(s.boxes[s.r.idx]?.outcome);
    expect(tv.outcome).toBeNull();
    expect(tv.results).toBeNull();
    expect(controllerView(s, 'p1').line).toBeNull();
  });

  it('step 0 lasts for the bets plus the event', () => {
    let s = liveAt();
    s = bet(s, 'p1', 0, 20);
    s = walkTo(s, 'open');
    const kind = s.boxes[s.r.idx]?.box.event ?? 'race';
    expect((s.phase.deadline ?? 0) - s.phase.startedAt).toBe(betsMs(1) + EVENT_MS[kind]);
  });

  it('whole games with events end cleanly', () => {
    for (let seed = 1; seed <= 6; seed++) {
      const states = playThrough(seed, 5, { live: true, rounds: 6 });
      expect(states.at(-1)?.phase.id, `seed ${seed}`).toBe('done');
    }
  });
});

describe('live events: three doors', () => {
  /** A game whose second box is the doors, car behind `car`, now at `bet`. */
  const doorsAt = (car: number): ReturnType<typeof start> => {
    let s = start(4, { rounds: 5 });
    const [round] = drawEvent('doors', seedRng(3), 1);
    s = { ...s, boxes: s.boxes.map((b, i) => (i === 1 ? { ...round, outcome: car } : b)) };
    s = walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
    expect(s.boxes[s.r.idx]?.box.event).toBe('doors');
    return s;
  };
  const swap = (s: ReturnType<typeof start>, id: string, door: number) =>
    send(s, {
      type: 'input',
      now: s.phase.startedAt + 200,
      playerId: id,
      input: { type: 'swap', door },
    });

  it('the host opens a goat door, never the car, preferring one nobody backed', () => {
    for (let car = 0; car < 3; car++) {
      let s = doorsAt(car);
      const goat = [0, 1, 2].find((d) => d !== car) ?? 0;
      s = bet(s, 'p1', goat, 10);
      s = walkTo(s, 'swap');
      expect(s.r.opened).not.toBe(car);
      expect(s.r.opened).not.toBe(goat);
      expect(tvView(s).opened).toBe(s.r.opened);
      // The car stays secret while players choose.
      expect(tvView(s).run).toBeNull();
      expect(tvView(s).outcome).toBeNull();
    }
  });

  it('no stake on the doors: straight to open', () => {
    const s = walkTo(doorsAt(0), 'open');
    expect(s.r.opened).toBeUndefined();
  });

  it('switching to the car pays ×2; staying on a goat loses', () => {
    let s = doorsAt(2);
    s = bet(s, 'p1', 0, 20);
    s = bet(s, 'p2', 0, 20);
    s = walkTo(s, 'swap');
    expect(s.r.opened).toBe(1);
    const before = { ...s.coins };
    s = swap(s, 'p1', 2);
    s = swap(s, 'p2', 0);
    s = walkTo(s, 'open');
    expect(s.coins['p1']).toBe((before['p1'] ?? 0) + 20);
    expect(s.coins['p2']).toBe((before['p2'] ?? 0) - 20);
  });

  it('a bettor on the opened door must move; the opened door is refused', () => {
    let s = doorsAt(0);
    s = bet(s, 'p1', 1, 10);
    s = bet(s, 'p2', 2, 10);
    s = walkTo(s, 'swap');
    const opened = s.r.opened ?? -1;
    const victim = opened === 1 ? 'p1' : 'p2';
    expect(controllerView(s, victim).myDoor).toBe(opened);
    expect(swap(s, victim, opened).r.swaps?.[victim]).toBeUndefined();
    // Undecided at the deadline: moved off the goat anyway.
    s = walkTo(s, 'open');
    expect(s.r.bets[victim]?.option).not.toBe(opened);
  });

  it('everyone chose: the doors open at once', () => {
    let s = doorsAt(1);
    for (const id of ['p1', 'p2', 'p3', 'p4']) s = bet(s, id, 0, 5);
    expect(s.phase.id).toBe('swap');
    const other = [1, 2].find((d) => d !== s.r.opened) ?? 1;
    for (const id of ['p1', 'p2', 'p3']) s = swap(s, id, 0);
    expect(s.phase.id).toBe('swap');
    s = swap(s, 'p4', other);
    expect(s.phase.id).toBe('open');
  });
});
