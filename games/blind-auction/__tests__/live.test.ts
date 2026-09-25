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
    for (const kind of LIVE_KINDS.filter((k) => k !== 'potato'))
      for (let seed = 1; seed <= 200; seed++) {
        const [round] = drawEvent(kind, seedRng(seed), 1);
        const { box, outcome, detail = [] } = round;
        expect(
          box.options.reduce((s, o) => s + o.chance, 0),
          kind,
        ).toBe(100);
        for (const o of box.options) {
          expect(o.label?.name, kind).toBeTruthy();
          // The shell game is a shared pot (pay 0), not odds.
          if (kind !== 'shells' && kind !== 'keno' && kind !== 'blackjack')
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
        if (kind === 'ghost' || kind === 'wires') {
          // The other three are checked first, each once; the right one is never among them.
          expect([...detail].sort()).toEqual([0, 1, 2, 3].filter((i) => i !== outcome));
        }
        if (kind === 'penalty') {
          const [aim = -1, keeper = -1] = detail;
          expect(aim).toBeGreaterThanOrEqual(0);
          expect(keeper).toBeLessThanOrEqual(2);
          // Saved: the keeper guessed right; a goal: the keeper went the other way.
          if (outcome === 1) expect(keeper).toBe(aim);
          if (outcome === 0) expect(keeper).not.toBe(aim);
        }
        if (kind === 'keno') {
          expect(new Set(detail).size).toBe(5);
          expect(detail.every((n) => n >= 1 && n <= 20)).toBe(true);
        }
        if (kind === 'coins') {
          const heads = detail.filter((f) => f === 1).length;
          expect(detail.length).toBeLessThanOrEqual(6);
          expect(outcome).toBe(heads === 0 ? 0 : heads <= 2 ? 1 : 2);
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
    // Pin the second box to a race (the draw's order varies; a race needs no teams or seats).
    const [race] = drawEvent('race', seedRng(9), 1);
    s = { ...s, boxes: s.boxes.map((b, i) => (i === 1 ? race : b)) };
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

describe('live events: tug of war', () => {
  /** A 4-player game whose second box is the tug, now at `bet`. */
  const tugAt = (): ReturnType<typeof start> => {
    let s = start(4, { rounds: 5 });
    const [round] = drawEvent('tug', seedRng(5), 1);
    s = {
      ...s,
      boxes: s.boxes.map((b, i) =>
        i === 1 ? { ...round, teams: { sun: ['p1', 'p3'], moon: ['p2', 'p4'] } } : b,
      ),
    };
    return walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
  };
  const pull = (s: ReturnType<typeof start>, id: string, dt: number) =>
    send(s, { type: 'input', now: s.phase.startedAt + dt, playerId: id, input: { type: 'tug' } });

  it('teams are public before the bet; you can only back your own side', () => {
    const s = tugAt();
    expect(controllerView(s, 'p1').myTeam).toBe(0);
    expect(tvView(s).tug?.sun).toEqual(['p1', 'p3']);
    expect(bet(s, 'p1', 1, 10).notices['p1']?.code).toBe('option');
    expect(bet(s, 'p1', 0, 10).r.bets['p1']?.amount).toBe(10);
  });

  it('a tap pulls by your share of your team stake; no stake, no pull', () => {
    let s = tugAt();
    s = bet(bet(bet(s, 'p1', 0, 30), 'p3', 0, 10), 'p2', 1, 20);
    s = bet(s, 'p4', 1, 0);
    expect(s.phase.id).toBe('tug');
    const a = pull(s, 'p1', 100);
    expect(a.r.rope).toBeCloseTo(-0.06 * 0.75);
    expect(pull(a, 'p1', 150).r.rope).toBe(a.r.rope); // inside 80 ms: one tap
    expect(pull(s, 'p4', 100).r.rope).toBe(0);
  });

  it('the rope over the line ends it; the side ahead wins and is paid', () => {
    let s = tugAt();
    s = bet(bet(bet(bet(s, 'p1', 0, 20), 'p3', 0, 0), 'p2', 1, 20), 'p4', 1, 0);
    const before = s.coins['p1'] ?? 0;
    for (let i = 0; s.phase.id === 'tug' && i < 100; i++) s = pull(s, 'p1', 100 + i * 100);
    expect(s.phase.id).toBe('open');
    expect(s.boxes[s.r.idx]?.outcome).toBe(0);
    expect(s.coins['p1']).toBeGreaterThan(before);
  });

  it('a dead heat gives every stake back', () => {
    let s = tugAt();
    s = bet(bet(bet(bet(s, 'p1', 0, 20), 'p3', 0, 0), 'p2', 1, 20), 'p4', 1, 0);
    const before = { ...s.coins };
    s = walkTo(s, 'open');
    expect(s.r.draw).toBe(true);
    expect(s.coins).toEqual(before);
  });
});

describe('live events: the shell game', () => {
  const shellsAt = (): ReturnType<typeof start> => {
    let s = start(4, { rounds: 5 });
    const [round] = drawEvent('shells', seedRng(6), 1);
    s = { ...s, boxes: s.boxes.map((b, i) => (i === 1 ? round : b)) };
    return walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
  };
  const cup = (s: ReturnType<typeof start>, id: string, c: number) =>
    send(s, {
      type: 'input',
      now: s.phase.startedAt + 100,
      playerId: id,
      input: { type: 'cup', cup: c },
    });

  it('the pot sets the speed; the shuffle moves the ball to the outcome; phones never see the swaps', () => {
    let s = shellsAt();
    s = bet(bet(bet(bet(s, 'p1', 0, 50), 'p2', 0, 50), 'p3', 0, 50), 'p4', 0, 50);
    expect(s.phase.id).toBe('shuffle');
    expect(s.r.tier).toBe(4); // 200 of 400: half the room's coins → ×8
    let ball = s.boxes[s.r.idx]?.detail?.[0] ?? 0;
    for (const [a, b] of s.r.moves ?? []) ball = ball === a ? b : ball === b ? a : ball;
    expect(s.boxes[s.r.idx]?.outcome).toBe(ball);
    expect(tvView(s).shellSwaps).toEqual(s.r.moves);
    expect(controllerView(s, 'p1').shellSwaps).toBeNull();
  });

  it('right calls split the whole pot by stake; all wrong → stakes back', () => {
    let s = shellsAt();
    s = bet(bet(bet(bet(s, 'p1', 0, 50), 'p2', 0, 25), 'p3', 0, 25), 'p4', 0, 0);
    s = walkTo(s, 'cups');
    const ball = s.boxes[s.r.idx]?.outcome ?? 0;
    const wrong = (ball + 1) % 3;
    const before = { ...s.coins };
    s = cup(cup(cup(s, 'p1', ball), 'p2', wrong), 'p3', ball);
    expect(s.phase.id).toBe('open');
    // The owner's example: 50 + 25 right, 25 wrong → 2/3 and 1/3 of 100 (67 + 33: the
    // remainder goes to the larger share, so the pot adds up).
    expect(s.coins['p1']).toBe((before['p1'] ?? 0) - 50 + 67);
    expect(s.coins['p3']).toBe((before['p3'] ?? 0) - 25 + 33);
    expect(s.coins['p2']).toBe((before['p2'] ?? 0) - 25);

    let t = shellsAt();
    t = bet(bet(bet(bet(t, 'p1', 0, 50), 'p2', 0, 25), 'p3', 0, 25), 'p4', 0, 0);
    t = walkTo(t, 'cups');
    const miss = ((t.boxes[t.r.idx]?.outcome ?? 0) + 1) % 3;
    const was = { ...t.coins };
    t = cup(cup(cup(t, 'p1', miss), 'p2', miss), 'p3', miss);
    expect(t.coins).toEqual(was);
    expect(controllerView(t, 'p1').line?.kind).toBe(t.r.step === 1 ? 'back' : undefined);
  });

  it('nobody staked: no shuffle, straight to open', () => {
    let s = shellsAt();
    for (const id of ['p1', 'p2', 'p3', 'p4']) s = bet(s, id, 0, 0);
    expect(s.phase.id).toBe('open');
  });
});

describe('live events: keno', () => {
  const kenoAt = (): ReturnType<typeof start> => {
    let s = start(3, { rounds: 5 });
    const [round] = drawEvent('keno', seedRng(8), 1);
    s = {
      ...s,
      boxes: s.boxes.map((b, i) => (i === 1 ? { ...round, detail: [1, 2, 3, 4, 5] } : b)),
    };
    return walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
  };
  const spots = (s: ReturnType<typeof start>, id: string, n: number[]) =>
    send(s, {
      type: 'input',
      now: s.phase.startedAt + 50,
      playerId: id,
      input: { type: 'spots', spots: n },
    });

  it('no numbers, no stake; the stake pays by matches (0 / back / ×2.2 / ×30)', () => {
    let s = kenoAt();
    expect(bet(s, 'p1', 0, 10).notices['p1']?.code).toBe('spots');
    s = spots(spots(spots(s, 'p1', [1, 2, 3]), 'p2', [1, 9, 10]), 'p3', [11, 12, 13]);
    const before = { ...s.coins };
    s = bet(bet(bet(s, 'p1', 0, 10), 'p2', 0, 10), 'p3', 0, 10);
    s = walkTo(s, 'box');
    expect(s.coins['p1']).toBe((before['p1'] ?? 0) - 10 + 300);
    expect(s.coins['p2']).toBe(before['p2']);
    expect(s.coins['p3']).toBe((before['p3'] ?? 0) - 10);
  });
});

describe('live events: every word the server writes has its Spanish', () => {
  it('names, flavour lines and option labels of every event', async () => {
    const { STRINGS } = await import('../client/strings');
    const es = (STRINGS as { es: Record<string, string> }).es;
    const missing: string[] = [];
    for (const kind of LIVE_KINDS.filter((k) => k !== 'potato')) {
      let rng = seedRng(3);
      for (let i = 0; i < 6; i++) {
        const [round, next] = drawEvent(kind, rng, 1);
        rng = next;
        for (const text of [
          round.box.name,
          round.box.flavour,
          ...round.box.options.map((o) => o.label?.name ?? ''),
        ])
          if (text && !es[text]) missing.push(`${kind}: ${text}`);
      }
    }
    expect([...new Set(missing)]).toEqual([]);
  });
});

describe('live events: blackjack', () => {
  const bjAt = (): ReturnType<typeof start> => {
    let s = start(3, { rounds: 5 });
    const [round] = drawEvent('blackjack', seedRng(4), 1);
    s = { ...s, boxes: s.boxes.map((b, i) => (i === 1 ? round : b)) };
    return walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
  };
  const act = (s: ReturnType<typeof start>, id: string, type: 'hit' | 'stand') =>
    send(s, { type: 'input', now: s.phase.startedAt + 100, playerId: id, input: { type } });

  it('stakers are dealt two cards, the dealer one up; the hole card only shows at open', () => {
    let s = bjAt();
    s = bet(bet(bet(s, 'p1', 0, 10), 'p2', 0, 10), 'p3', 0, 0);
    expect(s.phase.id).toBe('hands');
    expect(s.r.hands?.['p1']).toHaveLength(2);
    expect(s.r.hands?.['p3']).toBeUndefined();
    expect(tvView(s).blackjack?.dealer).toHaveLength(1);
    s = act(act(s, 'p1', 'stand'), 'p2', 'stand');
    expect(s.phase.id).toBe('open');
    expect((tvView(s).blackjack?.dealer.length ?? 0) >= 2).toBe(true);
  });

  it('pays: bust 0, beat the dealer ×2, push back, natural ×2.5', async () => {
    const { blackjackReturn, total } = await import('../server/phases/hands');
    const base = bjAt();
    const at = (hand: number[], dealer: number[]) =>
      blackjackReturn({ ...base, r: { ...base.r, hands: { p1: hand }, dealer } }, 'p1', 10);
    // cards: rank = n % 13 (0 = A, 9 = 10, 12 = K)
    expect(total([0, 12])).toBe(21);
    expect(at([9, 12, 4], [9, 7])).toBe(0); // 25: bust
    expect(at([9, 8], [9, 6])).toBe(20); // 19 beats 17
    expect(at([9, 7], [9, 7])).toBe(10); // push
    expect(at([0, 12], [9, 8])).toBe(25); // natural
    expect(at([9, 6], [9, 5, 9])).toBe(20); // dealer busts
  });
});

describe('review C3–C5', () => {
  it('C3: a pause during hot potato does not make it pop on resume', async () => {
    const { potatoOptions } = await import('../server/events');
    let s = start(4, { rounds: 5 });
    const names = s.seats.map((id) => s.players[id]?.name ?? id);
    const [round] = drawEvent('potato', seedRng(2), 1);
    s = {
      ...s,
      boxes: s.boxes.map((b, i) =>
        i === 1 ? { ...round, box: { ...round.box, options: potatoOptions(names) } } : b,
      ),
    };
    s = walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
    s = walkTo(bet(s, 'p1', 1, 10), 'potato');
    const popAt = s.r.popAt ?? 0;
    const at = s.phase.startedAt;
    s = send(s, { type: 'vip', now: at + 100, action: 'pause' });
    s = send(s, { type: 'vip', now: at + 100 + 60_000, action: 'resume' });
    expect(s.phase.id).toBe('potato');
    expect(s.r.popAt).toBe(popAt + 60_000);
  });

  it('C5: keno stats count only paying calls', () => {
    let s = start(3, { rounds: 5 });
    const [round] = drawEvent('keno', seedRng(8), 1);
    s = {
      ...s,
      boxes: s.boxes.map((b, i) => (i === 1 ? { ...round, detail: [1, 2, 3, 4, 5] } : b)),
    };
    s = walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
    for (const [id, n] of [
      ['p1', [11, 12, 13]],
      ['p2', [1, 2, 13]],
      ['p3', [14, 15, 16]],
    ] as const)
      s = send(s, {
        type: 'input',
        now: s.phase.startedAt + 50,
        playerId: id,
        input: { type: 'spots', spots: [...n] },
      });
    s = bet(bet(bet(s, 'p1', 0, 10), 'p2', 0, 10), 'p3', 0, 10);
    s = walkTo(s, 'box');
    expect(s.stats['p1']?.calls).toBe(0);
    expect(s.stats['p2']?.calls).toBe(1);
    expect(s.stats['p3']?.lost).toBe(10);
  });
});
