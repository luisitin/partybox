// The phase flow (README "Phases" + "Edge cases"): exits by deadline, all-done and VIP skip; the
// hive's paced steps; drops, one player, idle rooms, pause.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { order, phone, start, throughHive, timer, toRank, tv, vip } from './helpers';

describe('intro', () => {
  it('is a 2.5 s title beat after the shell stage (ADR-053), or a VIP skip', () => {
    const s = start();
    expect(s.phase.id).toBe('intro');
    expect(s.phase.deadline).toBe(s.phase.startedAt + 2500);
    expect(timer(s).phase.id).toBe('rank');
    expect(vip(s, 'skip').phase.id).toBe('rank');
    expect(tv(s).vipSkipHidden).toBeUndefined();
  });
});

describe('rank', () => {
  it('closes when every connected player has locked in', () => {
    let s = toRank(start());
    expect(s.phase.deadline).toBe(s.phase.startedAt + 30_000);
    s = order(s, 'a');
    s = order(s, 'b');
    expect(s.phase.id).toBe('rank');
    expect(tv(s).locked).toBe(2);
    s = order(s, 'c', [4, 3, 2, 1, 0]);
    expect(s.phase.id).toBe('hive');
  });

  it('a resent order replaces the earlier one', () => {
    let s = toRank(start());
    s = order(s, 'a', [0, 1, 2, 3, 4]);
    s = order(s, 'a', [4, 3, 2, 1, 0]);
    expect(s.q.orders['a']?.[0]).toBe(s.questions[0]?.items[4]?.id);
    expect(phone(s, 'a').mine?.[0]).toBe(s.questions[0]?.items[4]?.id);
  });

  it('ignores orders that are not the five ids once each, and spectators', () => {
    const s = toRank(start());
    const ids = s.questions[0]?.items.map((i) => i.id) ?? [];
    const send = (playerId: string, items: string[]) =>
      game.reduce(s, {
        type: 'input',
        now: s.phase.startedAt + 1,
        playerId,
        input: { type: 'order', items },
      });
    expect(
      send('a', [ids[0] ?? '', ids[0] ?? '', ids[2] ?? '', ids[3] ?? '', ids[4] ?? '']).q.orders,
    ).toEqual({});
    expect(send('a', ['x', 'y', 'z', 'w', 'v']).q.orders).toEqual({});
    expect(send('late', ids).q.orders).toEqual({});
    expect(send('__proto__', ids).q.orders).toEqual({});
  });

  it('ignores orders in the wrong phase', () => {
    const s = start();
    expect(order(s, 'a')).toBe(s);
  });

  it('closes at the deadline and on a VIP skip', () => {
    const s = order(toRank(start()), 'a');
    expect(timer(s).phase.id).toBe('hive');
    expect(vip(s, 'skip').phase.id).toBe('hive');
  });

  it('a drop that leaves everyone still here locked in closes it', () => {
    let s = order(order(toRank(start()), 'a'), 'b');
    s = game.reduce(s, {
      type: 'player',
      now: s.phase.startedAt + 2000,
      playerId: 'c',
      connected: false,
    });
    expect(s.phase.id).toBe('hive');
  });
});

describe('hive', () => {
  const ready = () => order(order(order(toRank(start()), 'a'), 'b'), 'c', [1, 0, 2, 3, 4]);

  it('says "The hive has decided…", then lands 5th to 1st, then scores', () => {
    let s = ready();
    expect(s.phase.id).toBe('hive');
    expect(tv(s).step).toBe(0);
    expect(tv(s).spots).toEqual([]);
    expect(tv(s).line).toBe('The hive has decided…');
    const places: number[][] = [];
    for (let i = 0; i < 5; i++) {
      s = timer(s);
      places.push(tv(s).spots.map((p) => p.place));
    }
    expect(places).toEqual([[5], [5, 4], [5, 4, 3], [5, 4, 3, 2], [5, 4, 3, 2, 1]]);
    expect(tv(s).line).toMatch(/^Number one: /);
    s = timer(s);
    expect(s.phase.id).toBe('score');
  });

  it('about 12 s without a voice', () => {
    const s = ready();
    const end = throughHive(s);
    expect(end.phase.startedAt - s.phase.startedAt).toBeGreaterThanOrEqual(11_000);
    expect(end.phase.startedAt - s.phase.startedAt).toBeLessThanOrEqual(14_000);
  });

  it('VIP skip is the next spot, then the score', () => {
    let s = ready();
    for (let i = 1; i <= 5; i++) {
      s = vip(s, 'skip', s.phase.startedAt + i * 10);
      expect(tv(s).step).toBe(i);
    }
    expect(vip(s, 'skip').phase.id).toBe('score');
  });

  it('shows the faces of exact spots, the average and "Unanimous!"', () => {
    let s = ready();
    for (let i = 0; i < 5; i++) s = timer(s);
    expect(tv(s).step).toBe(5);
    const spots = tv(s).spots;
    expect(tv(throughHive(s)).spots.every((p) => p.faces.length === 0)).toBe(true);
    const first = spots.find((p) => p.place === 1);
    // a and b sent the pack order, c swapped the first two: the hive keeps the pack order.
    expect(first?.faces).toEqual(['a', 'b']);
    expect(first?.avg).toBe(1.3);
    expect(spots.find((p) => p.place === 5)?.unanimous).toBe(true);
    expect(first?.unanimous).toBe(false);
  });

  it('fewer than two orders: "Not enough bees!", nothing scores, next round', () => {
    let s = order(toRank(start()), 'a');
    s = timer(s);
    expect(s.phase.id).toBe('hive');
    expect(tv(s).short).toBe(true);
    expect(tv(s).line).toBe('Not enough bees!');
    s = timer(s);
    expect(s.phase.id).toBe('rank');
    expect(s.q.n).toBe(2);
    expect(Object.values(s.scores)).toEqual([0, 0, 0]);
  });

  it('pause freezes the countdown and resume continues it', () => {
    let s = timer(ready()); // step 1
    const left = (s.phase.deadline ?? 0) - (s.phase.startedAt + 3000);
    s = vip(s, 'pause', s.phase.startedAt + 3000);
    expect(timer(s)).toBe(s);
    s = vip(s, 'resume', s.phase.startedAt + 60_000);
    expect((s.phase.deadline ?? 0) - (s.phase.startedAt + 60_000)).toBe(left);
    expect(tv(s).step).toBe(1);
  });
});

describe('score and the end', () => {
  it('applies the round once, then moves on; the last round ends the game', () => {
    let s = start({ rounds: 3 });
    s = toRank(s);
    for (let r = 1; r <= 3; r++) {
      s = order(order(order(s, 'a'), 'b'), 'c');
      s = throughHive(s);
      expect(s.phase.id).toBe('score');
      expect(Object.values(s.scores)).toEqual([12 * r, 12 * r, 12 * r]);
      expect(phone(s, 'a').next).toBe(r === 3 ? 'results' : 'round');
      s = timer(s);
    }
    expect(s.phase.id).toBe('done');
    expect(game.results(s)?.winnerIds.sort()).toEqual(['a', 'b', 'c']);
  });

  it('everyone idle: every round is short and the game still ends', () => {
    let s = toRank(start({ rounds: 6 }));
    for (let i = 0; i < 20 && s.phase.id !== 'done'; i++) s = timer(s);
    expect(s.phase.id).toBe('done');
    expect(s.phase.startedAt - 1_000_000).toBeLessThan(6 * 36_000 + 3_000);
    expect(game.results(s)?.ranking.map((r) => r.rank)).toEqual([1, 1, 1]);
  });

  it('one connected player: their lock closes the ranking, and nothing scores', () => {
    let s = toRank(start());
    for (const id of ['b', 'c'])
      s = game.reduce(s, {
        type: 'player',
        now: s.phase.startedAt + 10,
        playerId: id,
        connected: false,
      });
    s = order(s, 'a');
    expect(s.phase.id).toBe('hive');
    expect(tv(s).short).toBe(true);
  });

  it('VIP end jumps to done with everyone in the results', () => {
    const s = vip(order(toRank(start()), 'a'), 'end');
    expect(s.phase.id).toBe('done');
    expect(game.results(s)?.ranking).toHaveLength(3);
  });
});
