// Live events (LIVE-EVENTS.md): the setting puts an event in every other ordinary slot, each event
// is a fair bet whose outcome agrees with how it plays out, and the run reaches views only at open.
import { describe, expect, it } from 'vitest';
import { drawEvent } from '../server/events';
import { EVENT_MS, betsMs } from '../server/timing';
import { controllerView, tvView } from '../server/views';
import { LIVE_KINDS } from '../server/types';
import { seedRng } from '@partybox/game-sdk';
import { bet, playThrough, start, walkTo } from './helpers';

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
