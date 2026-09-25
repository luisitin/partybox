// Hidden information (README "Phases"; SPEC §6.5, §6.15): orders stay on their own phone until
// `hive`; the hive's spoken spots are asked for only when `hive` begins, and a reading's key is
// never in a view before its line plays.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { spotRequest } from '../server/speech';
import { order, phone, start, timer, toRank, tv } from './helpers';

const run = (o: readonly string[]): string => JSON.stringify(o).slice(1, -1);

describe('orders before the hive', () => {
  it('never appear on the TV or another phone during rank', () => {
    let s = toRank(start());
    s = order(s, 'a', [4, 2, 0, 3, 1]);
    s = order(s, 'b', [1, 3, 0, 4, 2]);
    const a = run(s.q.orders['a'] ?? []);
    const b = run(s.q.orders['b'] ?? []);
    expect(JSON.stringify(tv(s))).not.toContain(a);
    expect(JSON.stringify(tv(s))).not.toContain(b);
    expect(JSON.stringify(phone(s, 'c'))).not.toContain(a);
    expect(JSON.stringify(phone(s, 'b'))).not.toContain(a);
    expect(JSON.stringify(phone(s, 'a'))).toContain(a);
    expect(JSON.stringify(phone(s, 'spectator'))).not.toContain(a);
  });

  it('a bot’s hint (the expected order) reaches only bots', () => {
    const roster = [
      { id: 'a', name: 'Ana', avatarId: 'fox', connected: true },
      { id: 'r', name: 'Robo', avatarId: 'robot:1', connected: true, bot: true },
    ];
    const s = toRank(start({}, 1, roster));
    expect(phone(s, 'r').hint).toEqual(s.questions[0]?.expected);
    expect(phone(s, 'a').hint).toBeNull();
    expect(JSON.stringify(tv(s))).not.toContain(run(s.questions[0]?.expected ?? []));
  });
});

describe('spot readings', () => {
  it('are asked for only once hive begins', () => {
    let s = toRank(start({ reader: 'jessica' }));
    const asked: string[] = [];
    const collect = (): void => {
      for (const r of game.speech?.(s) ?? []) asked.push(r.key);
    };
    collect();
    s = order(order(s, 'a'), 'b');
    collect();
    expect(asked.some((k) => [1, 2, 3, 4, 5].some((st) => spotRequest(s, st)?.key === k))).toBe(
      false,
    );
    s = order(s, 'c');
    expect(s.phase.id).toBe('hive');
    const now = (game.speech?.(s) ?? []).map((r) => r.key);
    for (let st = 1; st <= 5; st++) expect(now).toContain(spotRequest(s, st)?.key);
  });

  it('never put a spot’s key in a view before that spot lands', () => {
    let s = order(order(order(toRank(start({ reader: 'jessica' })), 'a'), 'b'), 'c');
    for (const r of game.speech?.(s) ?? [])
      s = game.reduce(s, { type: 'speech', now: s.phase.startedAt + 50, key: r.key, ms: 900 });
    for (let st = 0; st <= 5; st++) {
      const text = JSON.stringify(tv(s)) + JSON.stringify(phone(s, 'a'));
      for (let later = st + 1; later <= 5; later++)
        expect(text).not.toContain(spotRequest(s, later)?.key ?? '§');
      if (st >= 1) expect(tv(s).speech?.key).toBe(spotRequest(s, st)?.key);
      s = timer(s);
    }
  });
});
