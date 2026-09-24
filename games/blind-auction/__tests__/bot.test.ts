// The bot (SPEC §8.11): EV from the hint's tier words, a personality, sealed and live play.
import { createRng } from '@partybox/game-sdk';
import { describe, expect, it } from 'vitest';
import { decide, expectedValue } from '../server/bot';
import { game } from '../server/index';
import type { State } from '../server/types';
import { raise, setOutcome, start, walkTo, withCoins } from './helpers';

function atBid(outcomes: Parameters<typeof setOutcome>[1][], coins = [100, 100, 100, 100]): State {
  let s = withCoins(walkTo(start(coins.length, {}, 1, coins.length), 'bid'), coins);
  const lot = s.lots[0];
  if (!lot) throw new Error('no lot');
  const lots = [...s.lots];
  lots[0] = { item: { ...lot.item, outcomes }, outcome: 0 };
  s = { ...s, lots };
  return s;
}

describe('bot', () => {
  it('turns tier words into chances (LIKELY 60 · MAYBE 30 · RARE 10, rescaled)', () => {
    const s = atBid([
      { type: 'gain', amount: 120, chance: 60 },
      { type: 'gain', amount: 300, chance: 30 },
      { type: 'lose', amount: 60, chance: 10 },
    ]);
    expect(expectedValue(game.controllerView(s, 'p1'))).toBeCloseTo(
      0.6 * 120 + 0.3 * 300 - 0.1 * 60,
    );
    const two = atBid([
      { type: 'gain', amount: 100, chance: 50 },
      { type: 'dud', chance: 50 },
    ]);
    expect(expectedValue(game.controllerView(two, 'p1'))).toBeCloseTo(50);
  });

  it("values heists on the richest other, swaps on the others' average, double and refund as if it paid 50", () => {
    const view = (outcomes: Parameters<typeof setOutcome>[1][]) =>
      game.controllerView(atBid(outcomes, [60, 200, 100, 30]), 'p1');
    expect(expectedValue(view([{ type: 'steal', percent: 30, chance: 100 }]))).toBeCloseTo(60);
    expect(expectedValue(view([{ type: 'swap', chance: 100 }]))).toBeCloseTo(110 - 60);
    expect(expectedValue(view([{ type: 'double', chance: 100 }]))).toBe(100);
    expect(expectedValue(view([{ type: 'refund', chance: 100 }]))).toBe(50);
  });

  it('bids EV × personality ± 10 %, to the nearest 5, within its coins; passes when EV ≤ 0', () => {
    const s = atBid([{ type: 'gain', amount: 100, chance: 100 }]);
    const view = game.controllerView(s, 'p1');
    const cautious = decide(view, 0.5, createRng(1));
    const reckless = decide(view, 1.1, createRng(1));
    expect(cautious).toMatchObject({ type: 'bid' });
    const c = cautious?.amount ?? 0;
    const r = reckless?.amount ?? 0;
    expect(c % 5).toBe(0);
    expect(c).toBeGreaterThanOrEqual(45);
    expect(c).toBeLessThanOrEqual(55);
    expect(r).toBeGreaterThan(c);
    expect(r).toBeLessThanOrEqual(100);
    const trap = atBid([{ type: 'lose', amount: 50, chance: 100 }]);
    expect(decide(game.controllerView(trap, 'p1'), 1.1, createRng(1))).toEqual({
      type: 'bid',
      amount: 0,
    });
  });

  it('varies: personalities differ across bots and bids differ across lots', () => {
    const s = start(8, {}, 3, 8);
    expect(new Set(Object.values(s.factors)).size).toBeGreaterThan(4);
    for (const f of Object.values(s.factors)) expect(f >= 0.5 && f <= 1.1).toBe(true);
    const amounts = new Set<number>();
    for (let seed = 1; seed <= 12; seed++) {
      const b = walkTo(start(4, {}, seed, 4), 'bid');
      const input = game.bot.sampleInput(b, 'p1', createRng(seed));
      if (input?.type === 'bid') amounts.add(input.amount);
    }
    expect(amounts.size).toBeGreaterThan(3);
  });

  it('bids once per lot in sealed mode', () => {
    const s = atBid([{ type: 'gain', amount: 100, chance: 100 }]);
    const input = game.bot.sampleInput(s, 'p1', createRng(2));
    expect(input).not.toBeNull();
    const after = game.reduce(s, {
      type: 'input',
      now: s.phase.startedAt + 5,
      playerId: 'p1',
      input: input!,
    });
    expect(game.bot.sampleInput(after, 'p1', createRng(2))).toBeNull();
  });

  it('live: raises by the smallest step while that stays within EV × factor, never against itself', () => {
    let s = walkTo(start(3, { style: 'live' }, 1, 3), 'live');
    s = setOutcome(s, { type: 'gain', amount: 60, chance: 100 });
    s = { ...s, factors: { p1: 1, p2: 1, p3: 1 } };
    expect(game.bot.sampleInput(s, 'p1', createRng(1))).toEqual({ type: 'raise', amount: 5 });
    s = raise(s, 'p1', 55, s.phase.startedAt + 10);
    expect(game.bot.sampleInput(s, 'p1', createRng(1))).toBeNull();
    expect(game.bot.sampleInput(s, 'p2', createRng(1))).toEqual({ type: 'raise', amount: 60 });
    s = raise(s, 'p2', 60, s.phase.startedAt + 20);
    expect(game.bot.sampleInput(s, 'p3', createRng(1))).toBeNull(); // 65 > EV 60
  });
});
