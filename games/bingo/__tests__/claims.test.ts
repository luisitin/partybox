// Pins the two-tap claim with dibs, the card-style menu holding the caller (and the 3 · 2 · 1 after
// it), and "deal me another" once per card at the intro.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { ARM_MS, RESUME_MS } from '../server/types';
import { callUntil, claim, daubAll, input, start, timer } from './helpers';

describe('two taps to claim, with dibs', () => {
  it('the first tap arms one card for 3 s; the second tap on it claims; a tap elsewhere re-arms', () => {
    let s = callUntil(start({ cards: 2 }), 'a', [0, 1, 2, 3, 4]);
    s = daubAll(s, 'a', [0, 1, 2, 3, 4]);
    const t = s.phase.startedAt + 500;
    s = input(s, 'a', { type: 'bingo', card: 1 }, t);
    expect(s.phase.id).toBe('play');
    expect(s.round.arm).toEqual({ playerId: 'a', card: 1, until: t + ARM_MS });
    expect(game.tvView(s).arm?.name).toBe('Ana');
    // A tap on the other card moves the window there instead of claiming card 2.
    s = input(s, 'a', { type: 'bingo', card: 0 }, t + 200);
    expect(s.phase.id).toBe('play');
    expect(s.round.arm?.card).toBe(0);
    s = input(s, 'a', { type: 'bingo', card: 0 }, t + 400);
    expect(s.phase.id).toBe('bingo');
    expect(s.round.arm).toBeNull();
  });

  it('the first to arm has dibs: others queue, a lapsed window passes to the next in line', () => {
    let s = callUntil(start(), 'a', [0, 1, 2, 3, 4]);
    const t = s.phase.startedAt + 500;
    s = input(s, 'b', { type: 'bingo', card: 0 }, t);
    s = input(s, 'a', { type: 'bingo', card: 0 }, t + 100);
    s = input(s, 'c', { type: 'bingo', card: 0 }, t + 200);
    expect(s.round.arm?.playerId).toBe('b');
    expect(s.round.queue.map((q) => q.playerId)).toEqual(['a', 'c']);
    expect(game.controllerView(s, 'a').queuePlace).toBe(1);
    expect(game.controllerView(s, 'c').queuePlace).toBe(2);
    // Ana's second tap while Ben holds dibs does nothing (she is already queued).
    expect(input(s, 'a', { type: 'bingo', card: 0 }, t + 300)).toBe(s);
    // Ben lets it lapse: his phone says so, and Ana gets a fresh 3 s from that moment.
    const lapsed = t + ARM_MS + 10;
    s = input(s, 'b', { type: 'lapse' }, lapsed);
    expect(s.round.arm).toEqual({ playerId: 'a', card: 0, until: lapsed + ARM_MS });
    expect(s.round.queue.map((q) => q.playerId)).toEqual(['c']);
    // Nobody says anything: the next call tick notices Ana's lapse and it is Cleo's turn.
    const tick = lapsed + ARM_MS + 500;
    const idle = game.reduce(s, {
      type: 'timer',
      now: tick,
      phaseId: 'play',
      startedAt: s.phase.startedAt,
    });
    expect(idle.round.arm).toEqual({ playerId: 'c', card: 0, until: tick + ARM_MS });
    expect(idle.round.queue).toEqual([]);
    expect(idle.round.drawn).toBe(s.round.drawn + 1);
  });

  it('a claim clears the queue; a card that won or a spectator cannot arm', () => {
    let s = callUntil(start(), 'a', [0, 1, 2, 3, 4]);
    s = daubAll(s, 'a', [0, 1, 2, 3, 4]);
    const t = s.phase.startedAt + 500;
    s = input(s, 'a', { type: 'bingo', card: 0 }, t);
    s = input(s, 'b', { type: 'bingo', card: 0 }, t + 50);
    s = input(s, 'a', { type: 'bingo', card: 0 }, t + 100);
    expect(s.phase.id).toBe('bingo');
    expect(s.round.queue).toEqual([]);
    expect(input(s, 'ghost', { type: 'bingo', card: 0 })).toBe(s);
    s = input(s, 'b', { type: 'continue', pattern: 'same' });
    expect(input(s, 'a', { type: 'bingo', card: 0 })).toBe(s); // Ana's card sits the pattern out
  });
});

describe('the card-style menu holds the caller', () => {
  it('opening a menu drops the deadline; the last close starts a 3 s countdown, then the next number', () => {
    let s = timer(start());
    const drawn = s.round.drawn;
    const t = s.phase.startedAt + 500;
    s = input(s, 'a', { type: 'menu', open: true }, t);
    expect(s.phase.deadline).toBeNull();
    expect(game.tvView(s).pausedBy).toEqual(['Ana']);
    expect(game.controllerView(s, 'a').menuOpen).toBe(true);
    s = input(s, 'b', { type: 'menu', open: true }, t + 100);
    expect(game.tvView(s).pausedBy).toEqual(['Ana', 'Ben']);
    // Daubs still land while held; nothing is called.
    s = input(s, 'c', { type: 'daub', card: 0, index: 3 }, t + 200);
    expect(s.round.daubs['c']).toEqual([[3]]);
    s = input(s, 'a', { type: 'menu', open: false }, t + 300);
    expect(s.phase.deadline).toBeNull(); // Ben still has his open
    s = input(s, 'b', { type: 'menu', open: false }, t + 400);
    expect(s.round.resumeAt).toBe(t + 400 + RESUME_MS);
    expect(s.phase.deadline).toBe(t + 400 + RESUME_MS);
    expect(game.tvView(s).pausedBy).toEqual([]);
    expect(s.round.drawn).toBe(drawn);
    s = timer(s);
    expect(s.round.drawn).toBe(drawn + 1);
    expect(s.round.resumeAt).toBeNull();
    expect(s.phase.deadline).toBe(s.phase.startedAt + 6000);
  });

  it('a menu left open through a check holds the caller as play resumes', () => {
    let s = callUntil(start(), 'a', [0, 1]);
    s = daubAll(s, 'a', [0, 1]);
    s = input(s, 'b', { type: 'menu', open: true });
    s = claim(s, 'a'); // invalid → check
    expect(s.phase.id).toBe('check');
    s = timer(s);
    expect(s.phase.id).toBe('play');
    expect(s.phase.deadline).toBeNull();
    expect(game.tvView(s).pausedBy).toEqual(['Ben']);
  });
});

describe('deal me another', () => {
  it('one fresh card per slot during the intro, the old one gone; nothing after the intro', () => {
    let s = start({ cards: 2 });
    const before = s.round.cards['a']?.map((c) => [...c]);
    expect(game.controllerView(s, 'a').swappable).toEqual([0, 1]);
    s = input(s, 'a', { type: 'swap', card: 1 });
    expect(s.round.cards['a']?.[0]).toEqual(before?.[0]);
    expect(s.round.cards['a']?.[1]).not.toEqual(before?.[1]);
    expect(s.round.cards['a']?.[1]?.[12]).toBe(0);
    expect(game.controllerView(s, 'a').swappable).toEqual([0]);
    const once = s;
    expect(input(once, 'a', { type: 'swap', card: 1 })).toBe(once);
    expect(input(once, 'ghost', { type: 'swap', card: 0 })).toBe(once);
    s = timer(s);
    expect(s.phase.id).toBe('play');
    expect(input(s, 'a', { type: 'swap', card: 0 })).toBe(s);
  });
});
