// Outcomes (SPEC §8.3, §8.7, §8.17): gain, lose (floor 0), steal from the richest other player
// (ties by the rng), swap, double, refund, dud; nothing to steal; nobody to swap with; scaling.
import { describe, expect, it } from 'vitest';
import type { Outcome } from '../content/schema';
import { drawLots, scaleAmount } from '../server/content';
import { game } from '../server/index';
import type { State } from '../server/types';
import { bid, send, setOutcome, start, walkTo, withCoins } from './helpers';

/** p1 wins the lot for `price` and it flips to `outcome`, with coins set before bidding. */
function flipWith(outcome: Outcome, price: number, coins: number[], n = coins.length): State {
  let s = withCoins(walkTo(start(n), 'bid'), coins);
  s = setOutcome(s, outcome);
  s = bid(s, 'p1', price);
  for (let i = 2; i <= n; i++) s = bid(s, `p${i}`, 0);
  return walkTo(s, 'flip');
}

describe('outcomes', () => {
  it('gain adds N; the SPEC §8.2 flip takes Ana from 10 to 310', () => {
    const s = flipWith({ type: 'gain', amount: 300, chance: 100 }, 90, [100, 100, 100]);
    expect(s.coins['p1']).toBe(310);
    expect(s.l.effect).toMatchObject({ kind: 'gain', amount: 300 });
  });

  it('lose takes N but never below 0', () => {
    expect(flipWith({ type: 'lose', amount: 60, chance: 100 }, 20, [100, 100]).coins['p1']).toBe(
      20,
    );
    const broke = flipWith({ type: 'lose', amount: 60, chance: 100 }, 70, [100, 100]);
    expect(broke.coins['p1']).toBe(0);
    expect(broke.l.effect?.amount).toBe(30);
    expect(broke.stats['p1']).toMatchObject({ trapped: 30, traps: 1 });
  });

  it('steal takes P% (rounded down) of the richest OTHER player', () => {
    const s = flipWith({ type: 'steal', percent: 30, chance: 100 }, 10, [100, 150, 99, 40]);
    expect(s.l.effect).toMatchObject({ kind: 'steal', other: 'p2', amount: 45 });
    expect([s.coins['p1'], s.coins['p2']]).toEqual([90 + 45, 105]);
    expect(s.stats['p1']?.thief).toBe(45);
  });

  it('a tie for richest is broken by the rng, never by seat', () => {
    const victims = new Set<string>();
    for (let seed = 1; seed <= 25; seed++) {
      let s = withCoins(walkTo(start(3, {}, seed), 'bid'), [100, 120, 120]);
      s = setOutcome(s, { type: 'steal', percent: 50, chance: 100 });
      s = bid(bid(bid(s, 'p1', 5), 'p2', 0), 'p3', 0);
      victims.add(walkTo(s, 'flip').l.effect?.other ?? '');
    }
    expect([...victims].sort()).toEqual(['p2', 'p3']);
  });

  it('heist when every other player has 0: steals 0 ("Nothing to steal!")', () => {
    const s = flipWith({ type: 'steal', percent: 40, chance: 100 }, 10, [100, 0, 0]);
    expect(s.l.effect).toMatchObject({ kind: 'steal', amount: 0 });
    expect(s.coins['p1']).toBe(90);
  });

  it('swap trades totals with another player who has not left', () => {
    let s = withCoins(walkTo(start(3), 'bid'), [100, 250, 30]);
    s = send(s, {
      type: 'player',
      now: s.phase.startedAt + 1,
      playerId: 'p3',
      connected: false,
      gone: 'left',
    });
    s = setOutcome(s, { type: 'swap', chance: 100 });
    s = bid(bid(s, 'p1', 20), 'p2', 0);
    s = walkTo(s, 'flip');
    expect(s.l.effect).toMatchObject({ kind: 'swap', other: 'p2' });
    expect([s.coins['p1'], s.coins['p2'], s.coins['p3']]).toEqual([250, 80, 30]);
    expect(s.stats['p1']?.thief).toBe(170);
  });

  it('swap with nobody eligible counts as a dud', () => {
    let s = walkTo(start(2), 'bid');
    s = send(s, {
      type: 'player',
      now: s.phase.startedAt + 1,
      playerId: 'p2',
      connected: false,
      gone: 'left',
    });
    s = setOutcome(s, { type: 'swap', chance: 100 });
    s = walkTo(bid(s, 'p1', 20), 'flip');
    expect(s.l.effect?.kind).toBe('dud');
    expect(s.coins['p1']).toBe(80);
  });

  it('double pays twice the price; refund pays it back; dud does nothing', () => {
    expect(flipWith({ type: 'double', chance: 100 }, 60, [100, 100]).coins['p1']).toBe(160);
    expect(flipWith({ type: 'refund', chance: 100 }, 60, [100, 100]).coins['p1']).toBe(100);
    expect(flipWith({ type: 'dud', chance: 100 }, 60, [100, 100]).coins['p1']).toBe(40);
  });

  it('the winner who dropped or left still gets the outcome', () => {
    let s = walkTo(start(3), 'bid');
    s = setOutcome(s, { type: 'gain', amount: 50, chance: 100 });
    s = bid(bid(bid(s, 'p1', 30), 'p2', 0), 'p3', 0);
    s = send(s, {
      type: 'player',
      now: s.phase.startedAt + 50,
      playerId: 'p1',
      connected: false,
      gone: 'left',
    });
    s = walkTo(s, 'flip');
    expect(s.coins['p1']).toBe(120);
  });

  it('coins on the strip move only when the stage shows it (price at the stamp, flip at step 1)', () => {
    let s = walkTo(start(2), 'bid');
    s = setOutcome(s, { type: 'gain', amount: 50, chance: 100 });
    s = bid(bid(s, 'p1', 30), 'p2', 0);
    const coinsOf = (st: State): number | undefined =>
      game.tvView(st).players.find((p) => p.id === 'p1')?.score;
    expect([s.phase.id, s.l.step, coinsOf(s)]).toEqual(['sold', 0, 100]);
    s = send(s, {
      type: 'timer',
      now: s.phase.deadline ?? 0,
      phaseId: 'sold',
      startedAt: s.phase.startedAt,
    });
    expect([s.l.step, coinsOf(s), game.controllerView(s, 'p1').coins]).toEqual([1, 70, 70]);
    s = walkTo(s, 'flip');
    expect([s.l.step, coinsOf(s)]).toEqual([0, 70]);
    s = send(s, {
      type: 'timer',
      now: s.phase.deadline ?? 0,
      phaseId: 'flip',
      startedAt: s.phase.startedAt,
    });
    expect([s.l.step, coinsOf(s)]).toEqual([1, 120]);
  });

  it('startCoins scales every coin amount to the nearest 5; percents stay', () => {
    expect(scaleAmount(120, 300)).toBe(360);
    expect(scaleAmount(75, 50)).toBe(40);
    expect(scaleAmount(5, 50)).toBe(5);
    const s = start(3, { startCoins: 250 });
    expect(Object.values(s.coins)).toEqual([250, 250, 250]);
    const [lots] = drawLots({ ...s.cfg, startCoins: 100 }, { seed: 5, step: 0 });
    const [scaled] = drawLots({ ...s.cfg, startCoins: 250 }, { seed: 5, step: 0 });
    lots.forEach((lot, i) =>
      lot.item.outcomes.forEach((o, j) => {
        const big = scaled[i]?.item.outcomes[j];
        if (o.type === 'gain' || o.type === 'lose')
          expect(big).toMatchObject({ amount: scaleAmount(o.amount, 250) });
        else expect(big).toEqual(o);
      }),
    );
  });
});
