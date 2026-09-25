// The bot (README "Players"): it plays from its own phone's view, lands near the writer's
// expected order, and its orders vary.
import { createRng } from '@partybox/game-sdk';
import { describe, expect, it } from 'vitest';
import { decide } from '../server/bot';
import { buildHive, scoreOrder } from '../server/hive';
import { game } from '../server/index';
import { phone, start, toRank } from './helpers';

const bots = [
  { id: 'r1', name: 'Robo', avatarId: 'robot:1', connected: true, bot: true },
  { id: 'r2', name: 'Rivet', avatarId: 'robot:2', connected: true, bot: true },
];

describe('bot', () => {
  it('sends a valid order in rank only, once', () => {
    const s = toRank(start({}, 3, bots));
    const rng = createRng(7);
    const input = game.bot.sampleInput(s, 'r1', rng);
    expect(input?.type).toBe('order');
    expect([...(input?.items ?? [])].sort()).toEqual(s.questions[0]?.items.map((i) => i.id).sort());
    const locked = game.reduce(s, {
      type: 'input',
      now: s.phase.startedAt + 900,
      playerId: 'r1',
      input: input!,
    });
    expect(game.bot.sampleInput(locked, 'r1', rng)).toBeNull();
    expect(game.bot.sampleInput(start({}, 3, bots), 'r1', rng)).toBeNull();
  });

  it('decides from its view: it is exactly decide(controllerView)', () => {
    const s = toRank(start({}, 5, bots));
    expect(game.bot.sampleInput(s, 'r2', createRng(11))).toEqual(
      decide(phone(s, 'r2'), createRng(11)),
    );
  });

  it('stays near the expected order and varies', () => {
    const s = toRank(start({ rounds: 10 }, 9, bots));
    const expected = s.questions[0]?.expected ?? [];
    const rng = createRng(3);
    const seen = new Set<string>();
    let total = 0;
    for (let i = 0; i < 200; i++) {
      const items = decide(phone(s, 'r1'), rng)?.items ?? [];
      seen.add(items.join());
      total += scoreOrder(items, expected).pts;
    }
    expect(seen.size).toBeGreaterThan(4);
    // Mostly close: on average well above a random order's ~4 points.
    expect(total / 200).toBeGreaterThan(6);
    expect(buildHive(expected, [expected, expected])?.order).toEqual(expected);
  });

  it('never sends the same order every round', () => {
    let s = toRank(start({ rounds: 5 }, 2, bots));
    const orders = new Set<string>();
    const rng = createRng(1);
    for (let r = 0; r < 5; r++) {
      for (const id of ['r1', 'r2']) {
        const input = game.bot.sampleInput(s, id, rng);
        if (input) {
          orders.add(input.items.join());
          s = game.reduce(s, { type: 'input', now: s.phase.startedAt + 1000, playerId: id, input });
        }
      }
      for (let i = 0; i < 10 && s.phase.id !== 'rank' && s.phase.id !== 'done'; i++)
        s = game.reduce(s, { type: 'vip', now: s.phase.startedAt + 10 + i, action: 'skip' });
    }
    expect(orders.size).toBeGreaterThanOrEqual(5);
  });
});
