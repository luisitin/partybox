// Sealed bidding (SPEC §8.6, §8.18): highest wins and pays, ties to fewer coins then the rng,
// passes, refused over-bids, early close, no takers.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { bid, send, skip, start, timer, walkTo, withCoins } from './helpers';

describe('sealed bidding', () => {
  it('the SPEC §8.2 round: Ana wins at 90 and only she pays', () => {
    let s = walkTo(start(5), 'bid');
    for (const [id, amount] of [
      ['p1', 90],
      ['p2', 40],
      ['p3', 0],
      ['p4', 75],
    ] as const)
      s = bid(s, id, amount);
    expect(s.phase.id).toBe('bid');
    s = bid(s, 'p5', 60);
    expect(s.phase.id).toBe('sold'); // everyone in: closes early
    expect(s.l.winner).toBe('p1');
    expect(s.l.price).toBe(90);
    expect(s.coins).toEqual({ p1: 10, p2: 100, p3: 100, p4: 100, p5: 100 });
    expect(game.tvView(s).sale?.ladder.map((r) => r.amount)).toEqual([40, 60, 75, 90]);
    expect(game.tvView(s).sale?.passes).toBe(1);
  });

  it('a resend changes the bid; the last one stands', () => {
    let s = walkTo(start(3), 'bid');
    s = bid(s, 'p1', 50);
    s = bid(s, 'p1', 20);
    s = bid(s, 'p2', 30);
    s = bid(s, 'p3', 0);
    expect(s.l.winner).toBe('p2');
  });

  it('a tie goes to the tied player with fewer coins', () => {
    let s = withCoins(walkTo(start(3), 'bid'), [100, 80, 100]);
    s = bid(s, 'p1', 50);
    s = bid(s, 'p2', 50);
    s = bid(s, 'p3', 10);
    expect(s.l.winner).toBe('p2');
    expect(s.l.tie).toBe(true);
    expect(s.coins['p2']).toBe(30);
    // The ladder ends on the SOLD bid: the tie's winner tops the rung.
    expect(game.tvView(s).sale?.ladder.map((r) => r.id)).toEqual(['p3', 'p1', 'p2']);
  });

  it('a tie on coins too is settled by the rng, the same way on replay', () => {
    const winners = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      let s = walkTo(start(3, {}, seed), 'bid');
      s = bid(s, 'p1', 40);
      s = bid(s, 'p2', 40);
      s = bid(s, 'p3', 40);
      winners.add(s.l.winner ?? '');
      let again = walkTo(start(3, {}, seed), 'bid');
      for (const id of ['p1', 'p2', 'p3']) again = bid(again, id, 40);
      expect(again.l.winner).toBe(s.l.winner);
    }
    expect(winners.size).toBe(3);
  });

  it('submission order never matters', () => {
    let a = walkTo(start(3, {}, 9), 'bid');
    a = bid(bid(bid(a, 'p1', 30), 'p2', 30), 'p3', 5);
    let b = walkTo(start(3, {}, 9), 'bid');
    b = bid(bid(bid(b, 'p3', 5), 'p2', 30), 'p1', 30);
    expect(b.l.winner).toBe(a.l.winner);
  });

  it('a bid above your coins is refused with the amount you have', () => {
    let s = walkTo(start(3), 'bid');
    s = bid(s, 'p1', 150, s.phase.startedAt + 500);
    expect(s.l.bids).toEqual({});
    expect(game.controllerView(s, 'p1').notice).toEqual({
      code: 'over',
      have: 100,
      at: s.phase.startedAt + 500,
    });
    expect(game.controllerView(s, 'p2').notice).toBeNull();
    s = bid(s, 'p1', 100);
    expect(game.controllerView(s, 'p1').notice).toBeNull();
    expect(game.controllerView(s, 'p1').myBid).toBe(100);
  });

  it('everyone passing, or nobody bidding, is "No takers!": nobody pays, the card still flips', () => {
    let s = walkTo(start(3), 'bid');
    for (const id of ['p1', 'p2', 'p3']) s = bid(s, id, 0);
    expect(s.phase.id).toBe('sold');
    expect(s.l.winner).toBeNull();
    s = timer(timer(s));
    expect(s.phase.id).toBe('flip');
    expect(game.tvView(s).outcome).not.toBeNull();
    expect(s.l.effect?.kind).toBe('none');
    expect(Object.values(s.coins)).toEqual([100, 100, 100]);
    const idle = timer(walkTo(start(3), 'bid'));
    expect(idle.phase.id).toBe('sold');
    expect(idle.l.winner).toBeNull();
  });

  it('a drop can complete the round: everyone still connected has bid', () => {
    let s = walkTo(start(3), 'bid');
    s = bid(bid(s, 'p1', 10), 'p2', 20);
    s = send(s, { type: 'player', now: s.phase.startedAt + 200, playerId: 'p3', connected: false });
    expect(s.phase.id).toBe('sold');
    expect(s.l.winner).toBe('p2');
  });

  it('spectators and wrong-phase inputs are ignored', () => {
    let s = walkTo(start(3), 'bid');
    const before = s;
    s = bid(s, 'ghost', 10);
    s = send(s, {
      type: 'input',
      now: s.phase.startedAt + 1,
      playerId: 'p1',
      input: { type: 'raise', amount: 10 },
    });
    expect(s).toEqual(before);
    const lot = walkTo(start(3), 'lot');
    expect(bid(lot, 'p1', 10)).toBe(lot);
  });

  it('the VIP skip closes bidding with the bids so far', () => {
    let s = walkTo(start(3), 'bid');
    s = bid(s, 'p2', 15);
    s = skip(s);
    expect(s.phase.id).toBe('sold');
    expect(s.l.winner).toBe('p2');
  });
});
