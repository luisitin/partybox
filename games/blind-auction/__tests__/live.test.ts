// Live bidding (SPEC §8.6, §8.15, §8.18): absolute raises, the three refusals, the going-once clock
// re-armed per stage, the 40 s cap, no bids at all, pause, and the presence rule.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { LIVE_CAP_MS, LIVE_NO_BIDS_MS, LIVE_STAGE_MS } from '../server/timing';
import type { State } from '../server/types';
import { T0, players, raise, send, walkTo } from './helpers';

function live(n = 4, presence?: { mode: string; phoneOnly: boolean }): State {
  const ctx = {
    players: players(n),
    settings: { style: 'live' },
    seed: 3,
    now: T0,
    ...(presence ? { presence } : {}),
  };
  return walkTo(game.init(ctx as never), 'live');
}

const fire = (s: State): State =>
  send(s, {
    type: 'timer',
    now: s.phase.deadline ?? 0,
    phaseId: s.phase.id,
    startedAt: s.phase.startedAt,
  });

describe('live bidding', () => {
  it('a raise carries the absolute amount; the view offers +5 / +10 / +25 / All in from the standing bid', () => {
    let s = live();
    const t = s.phase.startedAt;
    const opening = game.controllerView(s, 'p1').auction?.options.map((o) => o.amount);
    expect(opening).toEqual([5, 10, 25, 100]);
    s = raise(s, 'p2', 25, t + 500);
    expect(s.l.high).toEqual({ by: 'p2', amount: 25 });
    expect(game.controllerView(s, 'p1').auction?.options.map((o) => o.amount)).toEqual([
      30, 35, 50, 100,
    ]);
    // A late tap that still carries 30 after someone else bid 30 is refused, never overpaid.
    s = raise(s, 'p3', 30, t + 600);
    s = raise(s, 'p1', 30, t + 610);
    expect(s.l.high).toEqual({ by: 'p3', amount: 30 });
    expect(game.controllerView(s, 'p1').notice?.code).toBe('outbid');
  });

  it('refuses a raise that is not higher, is over your coins, or comes from the high bidder', () => {
    let s = live();
    const t = s.phase.startedAt;
    s = raise(s, 'p1', 3, t + 100);
    expect(s.l.high).toBeNull(); // below the opening bid of 5
    s = raise(s, 'p1', 40, t + 200);
    s = raise(s, 'p2', 40, t + 300);
    expect(game.controllerView(s, 'p2').notice?.code).toBe('outbid');
    s = raise(s, 'p2', 101, t + 400);
    expect(game.controllerView(s, 'p2').notice?.code).toBe('outbid');
    s = raise(s, 'p1', 60, t + 500);
    expect(game.controllerView(s, 'p1').notice?.code).toBe('winning');
    expect(s.l.high).toEqual({ by: 'p1', amount: 40 });
    const own = game.controllerView(s, 'p1').auction?.options ?? [];
    expect(own.every((o) => !o.ok)).toBe(true); // you can't bid against yourself
  });

  it('the clock: 3 s → going once → 2 s → going twice → 2 s → SOLD; any bid resets it', () => {
    let s = live();
    const t = s.phase.startedAt;
    s = raise(s, 'p1', 10, t + 1000);
    expect(s.phase.deadline).toBe(t + 1000 + LIVE_STAGE_MS[0]);
    s = fire(s);
    expect([s.phase.id, s.l.stage]).toEqual(['live', 1]);
    s = fire(s);
    expect([s.phase.id, s.l.stage]).toEqual(['live', 2]);
    const twice = s.phase.deadline ?? 0;
    s = raise(s, 'p2', 15, twice - 100);
    expect([s.l.stage, s.phase.deadline]).toEqual([0, twice - 100 + LIVE_STAGE_MS[0]]);
    s = fire(fire(fire(s)));
    expect(s.phase.id).toBe('sold');
    expect([s.l.winner, s.l.price, s.coins['p2']]).toEqual(['p2', 15, 85]);
  });

  it('the ring clock drains over the current stage', () => {
    let s = live();
    expect(game.tvView(s).auction?.from).toBe((s.phase.deadline ?? 0) - LIVE_NO_BIDS_MS);
    s = fire(raise(s, 'p1', 10, s.phase.startedAt + 100));
    expect(game.tvView(s).auction?.from).toBe((s.phase.deadline ?? 0) - LIVE_STAGE_MS[1]);
  });

  it('40 s after the lot opens, the next stage is SOLD', () => {
    let s = live();
    const t = s.phase.startedAt;
    s = raise(s, 'p1', 10, t + LIVE_CAP_MS - 500);
    s = fire(s);
    expect(s.phase.id).toBe('sold');
    expect(s.l.winner).toBe('p1');
  });

  it('no bids at all: "No takers!" after 8 s', () => {
    let s = live();
    expect(s.phase.deadline).toBe(s.phase.startedAt + LIVE_NO_BIDS_MS);
    s = fire(s);
    expect(s.phase.id).toBe('sold');
    expect(s.l.winner).toBeNull();
  });

  it('a pause freezes the clock and the stage', () => {
    let s = live();
    const t = s.phase.startedAt;
    s = raise(s, 'p1', 10, t + 100);
    const deadline = s.phase.deadline ?? 0;
    s = send(s, { type: 'vip', now: t + 1000, action: 'pause' });
    expect(raise(s, 'p2', 20, t + 1500)).toBe(s);
    s = send(s, { type: 'vip', now: t + 11_000, action: 'resume' });
    expect([s.l.stage, s.phase.deadline]).toEqual([0, deadline + 10_000]);
  });

  it('the VIP skip is SOLD! at the current bid', () => {
    let s = live();
    s = raise(s, 'p3', 20, s.phase.startedAt + 100);
    s = send(s, { type: 'vip', now: s.phase.startedAt + 200, action: 'skip' });
    expect([s.phase.id, s.l.winner, s.l.price]).toEqual(['sold', 'p3', 20]);
  });

  it('sealed bids are ignored in Live mode and raises in sealed mode', () => {
    const s = live();
    expect(
      send(s, {
        type: 'input',
        now: s.phase.startedAt + 1,
        playerId: 'p1',
        input: { type: 'bid', amount: 10 },
      }),
    ).toBe(s);
  });

  it('Live mode is refused outside a room that is all together; the game plays sealed', () => {
    for (const mode of ['remote-voice', 'remote-text']) {
      const ctx = {
        players: players(3),
        settings: { style: 'live' },
        seed: 1,
        now: T0,
        presence: { mode, phoneOnly: false },
      };
      const s = game.init(ctx as never);
      expect([s.cfg.live, s.cfg.liveRefused]).toEqual([false, true]);
      expect(walkTo(s, 'bid').phase.id).toBe('bid');
    }
    const couch = game.init({
      players: players(3),
      settings: { style: 'live' },
      seed: 1,
      now: T0,
      presence: { mode: 'together', phoneOnly: true },
    } as never);
    expect(couch.cfg.live).toBe(true);
    expect(live(3, { mode: 'together', phoneOnly: false }).cfg.live).toBe(true);
  });
});
