// Betting and payouts: stakes, right calls paid by the odds (×2 on the grand box), wrong calls lose
// the stake, sitting out, refusals, the pity top-up, early close, and the reveal-gated coins.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { payOf, payout, tierOf } from '../server/odds';
import { PITY_COINS } from '../server/timing';
import type { State } from '../server/types';
import { bet, send, setOutcome, skip, start, timer, walkTo, withCoins } from './helpers';

function atBet(n = 3, settings = {}): State {
  return walkTo(start(n, settings), 'bet');
}

describe('odds', () => {
  it('tier words follow the chance bands', () => {
    expect([tierOf(50), tierOf(49), tierOf(20), tierOf(19)]).toEqual([
      'LIKELY',
      'MAYBE',
      'MAYBE',
      'RARE',
    ]);
  });

  it('pays a touch over fair odds: the favourite little, the long shot big, every bet ≥ 1.0 back on average', () => {
    expect([payOf(60), payOf(50), payOf(30), payOf(20), payOf(10), payOf(70)]).toEqual([
      1.7, 2, 3.4, 5, 10, 1.5,
    ]);
    // Every whole-% chance: a bet returns 1.00–1.08 of the stake on average.
    for (let c = 5; c <= 90; c++) {
      const ev = (payOf(c) * c) / 100;
      expect(ev, `chance ${c}`).toBeGreaterThanOrEqual(1);
      expect(ev, `chance ${c}`).toBeLessThanOrEqual(1.09);
    }
    expect(payout(40, 3, false)).toBe(120);
    expect(payout(40, 3, true)).toBe(240);
    expect(payout(15, 1.5, false)).toBe(22);
  });
});

describe('betting', () => {
  it('a right call pays stake × odds; a wrong one loses the stake; sitting out costs nothing', () => {
    let s = setOutcome(atBet(3), 1);
    const pay = s.boxes[s.r.idx]?.box.options[1]?.pay ?? 0;
    s = bet(bet(bet(s, 'p1', 1, 40), 'p2', 0, 30), 'p3', 0, 0);
    expect(s.phase.id).toBe('open'); // everyone in: closes early
    expect(s.coins).toEqual({ p1: 100 - 40 + Math.floor(40 * pay), p2: 70, p3: 100 });
  });

  it('coins on the strip and the phones move only once the box is open (step 1)', () => {
    let s = setOutcome(atBet(2), 0);
    s = bet(bet(s, 'p1', 0, 50), 'p2', 1, 20);
    const shown = (st: State, id: string): number | undefined =>
      game.tvView(st).players.find((p) => p.id === id)?.score;
    expect([s.r.step, shown(s, 'p1'), shown(s, 'p2'), game.controllerView(s, 'p1').coins]).toEqual([
      0, 100, 100, 100,
    ]);
    expect(game.tvView(s).outcome).toBeNull();
    s = timer(s);
    expect(s.r.step).toBe(1);
    expect(shown(s, 'p2')).toBe(80);
    expect(game.tvView(s).outcome).toBe(0);
    expect(game.controllerView(s, 'p2').line).toEqual({ kind: 'lost', option: 1, amount: 20 });
  });

  it('the grand box pays double', () => {
    let s = walkTo(start(2, { rounds: 5 }), 'bet');
    for (let i = 0; i < 4; i++) s = walkTo(skip(s), 'bet');
    expect(s.boxes[s.r.idx]?.box.grand).toBe(true);
    s = setOutcome(s, 0);
    const pay = s.boxes[s.r.idx]?.box.options[0]?.pay ?? 0;
    expect(game.tvView(s).box?.options[0]?.pay).toBe(pay * 2);
    s = bet(bet(s, 'p1', 0, 10), 'p2', 1, 0);
    expect(s.coins['p1']).toBe(100 - 10 + Math.floor(10 * pay * 2));
  });

  it('refuses a stake above your coins, or a content the box does not have', () => {
    let s = atBet(2);
    s = bet(s, 'p1', 0, 150, s.phase.startedAt + 300);
    expect(s.r.bets).toEqual({});
    expect(game.controllerView(s, 'p1').notice).toMatchObject({ code: 'over', have: 100 });
    const options = s.boxes[s.r.idx]?.box.options.length ?? 0;
    s = bet(s, 'p1', options, 10);
    expect(s.r.bets).toEqual({});
    s = bet(s, 'p1', 0, 100);
    expect(game.controllerView(s, 'p1').notice).toBeNull();
    expect(game.controllerView(s, 'p1').myBet).toEqual({ option: 0, amount: 100 });
  });

  it('a resend changes the bet; the last one stands', () => {
    let s = setOutcome(atBet(2), 0);
    s = bet(s, 'p1', 1, 50);
    s = bet(s, 'p1', 0, 20);
    s = bet(s, 'p2', 1, 0);
    expect(s.r.bets['p1']).toEqual({ option: 0, amount: 20 });
  });

  it('a broke player is topped up to the pity stake when betting opens', () => {
    let s = withCoins(walkTo(start(2), 'box'), [0, 50]);
    s = timer(s);
    expect(s.phase.id).toBe('bet');
    expect(s.coins).toEqual({ p1: PITY_COINS, p2: 50 });
    expect(game.controllerView(s, 'p1').topped).toBe(true);
    expect(game.controllerView(s, 'p2').topped).toBe(false);
  });

  it('a drop can close the betting; the deadline and the VIP always do', () => {
    let s = atBet(3);
    s = bet(bet(s, 'p1', 0, 10), 'p2', 0, 10);
    s = send(s, { type: 'player', now: s.phase.startedAt + 200, playerId: 'p3', connected: false });
    expect(s.phase.id).toBe('open');
    expect(timer(atBet(3)).phase.id).toBe('open');
    expect(skip(atBet(3)).phase.id).toBe('open');
  });

  it('spectators and wrong-phase inputs are ignored', () => {
    const s = atBet(2);
    expect(bet(s, 'ghost', 0, 10)).toBe(s);
    const box = walkTo(start(2), 'box');
    expect(bet(box, 'p1', 0, 10)).toBe(box);
  });

  it('nobody bets: the box still opens, nobody wins or loses', () => {
    let s = timer(atBet(3));
    s = timer(s);
    expect([s.phase.id, s.r.step]).toEqual(['open', 1]);
    expect(game.tvView(s).results).toEqual([]);
    expect(Object.values(s.coins)).toEqual([100, 100, 100]);
  });
});
