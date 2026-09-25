// Twists (LIVE-EVENTS.md): the toggle puts one on each odds event; early-bird pays more for an
// early bet, insurance gives half back on a miss for a 10 % fee, the pool splits the pot.
import { describe, expect, it } from 'vitest';
import { drawEvent } from '../server/events';
import { insuranceFee } from '../server/odds';
import { seedRng } from '@partybox/game-sdk';
import type { Twist } from '../server/types';
import { send, start, walkTo } from './helpers';

/** A 3-player game whose second box is a dice roll with `twist`, now at `bet`. */
function twisted(twist: Twist): ReturnType<typeof start> {
  let s = start(3, { rounds: 5 });
  const [round] = drawEvent('dice', seedRng(5), 1);
  s = {
    ...s,
    boxes: s.boxes.map((b, i) => (i === 1 ? { ...round, box: { ...round.box, twist } } : b)),
  };
  return walkTo(walkTo(walkTo(s, 'bet'), 'box'), 'bet');
}
const betAt = (
  s: ReturnType<typeof start>,
  id: string,
  option: number,
  amount: number,
  dt: number,
  insured = false,
) =>
  send(s, {
    type: 'input',
    now: s.phase.startedAt + dt,
    playerId: id,
    input: { type: 'bet', option, amount, insured },
  });

describe('twists', () => {
  it('the toggle gives odds events a twist; off, none', () => {
    const on = start(4, { rounds: 12, live: true, twists: true });
    const events = on.boxes.filter((b) => b.box.event);
    const odds = events.filter((b) =>
      ['race', 'dice', 'wheel', 'coins', 'penalty', 'ghost', 'wires'].includes(b.box.event ?? ''),
    );
    expect(odds.every((b) => b.box.twist)).toBe(true);
    expect(events.filter((b) => !odds.includes(b)).every((b) => !b.box.twist)).toBe(true);
    expect(start(4, { rounds: 12, live: true }).boxes.some((b) => b.box.twist)).toBe(false);
  });

  it('early bird: the first second pays ~×1.25 more than the last', () => {
    let s = twisted('early');
    const before = { ...s.coins };
    const win = s.boxes[s.r.idx]?.outcome ?? 0;
    s = betAt(betAt(betAt(s, 'p1', win, 20, 0), 'p2', win, 20, 19_900), 'p3', win, 0, 100);
    s = walkTo(s, 'box');
    const early = (s.coins['p1'] ?? 0) - (before['p1'] ?? 0);
    const late = (s.coins['p2'] ?? 0) - (before['p2'] ?? 0);
    expect(early).toBeGreaterThan(late);
  });

  it('insurance: a 10 % fee, half the stake back on a miss', () => {
    let s = twisted('insure');
    const before = { ...s.coins };
    const miss = ((s.boxes[s.r.idx]?.outcome ?? 0) + 1) % 3;
    s = betAt(betAt(betAt(s, 'p1', miss, 40, 50, true), 'p2', miss, 40, 50), 'p3', miss, 0, 50);
    s = walkTo(s, 'box');
    expect(s.coins['p1']).toBe((before['p1'] ?? 0) - 40 + 20 - insuranceFee(40));
    expect(s.coins['p2']).toBe((before['p2'] ?? 0) - 40);
  });

  it('pool: the right calls split the whole pot', () => {
    let s = twisted('pool');
    const before = { ...s.coins };
    const win = s.boxes[s.r.idx]?.outcome ?? 0;
    const miss = (win + 1) % 3;
    s = betAt(betAt(betAt(s, 'p1', win, 30, 50), 'p2', win, 10, 50), 'p3', miss, 40, 50);
    s = walkTo(s, 'box');
    const gained = (['p1', 'p2', 'p3'] as const).map(
      (id) => (s.coins[id] ?? 0) - (before[id] ?? 0),
    );
    expect(gained.reduce((a, b) => a + b, 0)).toBe(0);
    expect(gained[0]).toBe(30);
    expect(gained[1]).toBe(10);
  });
});
