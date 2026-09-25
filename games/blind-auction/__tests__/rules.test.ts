// The rules and the ready-up (the owner, 2026-09-24): everyone reads, taps Ready, then 3·2·1.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { COUNTDOWN_MS, RULES_SAFETY_MS } from '../server/timing';
import { bet, ready, send, skip, start, timer, walkTo } from './helpers';

describe('rules and ready-up', () => {
  it('opens on the rules; bots are ready from the start', () => {
    const s = start(4, {}, 1, 2);
    expect(s.phase.id).toBe('rules');
    // No visible clock: the game waits for everyone (the owner's rule [cc45f4]); only a 3-minute
    // safety net keeps an idle phone from holding the room.
    expect(s.phase.deadline).toBe(s.phase.startedAt + RULES_SAFETY_MS);
    expect(game.tvView(s).timerMode).toBe('hidden');
    expect(s.ready.sort()).toEqual(['p3', 'p4']);
    expect(game.tvView(s).readyIds.sort()).toEqual(['p3', 'p4']);
  });

  it('when everyone is ready: a 3 s countdown, then the first box', () => {
    let s = start(3);
    s = ready(ready(s, 'p1'), 'p2');
    expect([s.phase.id, s.rulesStep]).toEqual(['rules', 0]);
    expect(game.controllerView(s, 'p1').ready).toBe(true);
    s = ready(s, 'p3', s.phase.startedAt + 5000);
    expect([s.phase.id, s.rulesStep]).toEqual(['rules', 1]);
    expect(s.phase.deadline).toBe(s.phase.startedAt + 5000 + COUNTDOWN_MS);
    s = timer(s);
    expect(s.phase.id).toBe('box');
  });

  it("waits for everyone; the VIP's Start now is the escape", () => {
    let s = start(3);
    s = ready(s, 'p1');
    expect(game.tvView(s).vipSkipLabel).toBe('Start now');
    s = skip(s);
    expect([s.phase.id, s.rulesStep]).toEqual(['rules', 1]);
    expect(timer(s).phase.id).toBe('box');
  });

  it('a drop can complete the ready-up; repeats and spectators change nothing', () => {
    let s = start(3);
    s = ready(ready(s, 'p1'), 'p2');
    expect(ready(s, 'p1')).toBe(s);
    expect(ready(s, 'ghost')).toBe(s);
    s = send(s, { type: 'player', now: s.phase.startedAt + 50, playerId: 'p3', connected: false });
    expect(s.rulesStep).toBe(1);
  });

  it('the VIP skip counts 3·2·1, then the first box', () => {
    const s = skip(start(3));
    expect([s.phase.id, s.rulesStep]).toEqual(['rules', 1]);
    expect(timer(s).phase.id).toBe('box');
  });

  it('a slow reader is never skipped: with anyone ready, the safety net keeps waiting', () => {
    let s = start(3);
    s = ready(ready(s, 'p1'), 'p2');
    s = timer(s);
    expect([s.phase.id, s.rulesStep]).toEqual(['rules', 0]);
    s = timer(s);
    expect([s.phase.id, s.rulesStep]).toEqual(['rules', 0]);
    s = ready(s, 'p3', (s.phase.deadline ?? 0) - 1);
    expect(s.rulesStep).toBe(1);
  });

  it('a phone that never taps is given up on after 10 minutes', () => {
    let s = ready(start(3), 'p1');
    for (let i = 0; i < 4; i++) s = timer(s);
    expect([s.phase.id, s.rulesStep]).toEqual(['rules', 1]);
  });

  it('nobody touched anything: the safety net starts the countdown', () => {
    const s = timer(start(3));
    expect([s.phase.id, s.rulesStep]).toEqual(['rules', 1]);
  });
});

describe('pause and resume (reviewer [12ea6b])', () => {
  it('the last player drops during a pause: the resume moves on', () => {
    let s = walkTo(start(3), 'bet');
    s = bet(bet(s, 'p1', 0, 10), 'p2', 0, 10);
    s = send(s, { type: 'vip', now: s.phase.startedAt + 200, action: 'pause' });
    s = send(s, { type: 'player', now: s.phase.startedAt + 300, playerId: 'p3', connected: false });
    expect(s.phase.id).toBe('bet');
    s = send(s, { type: 'vip', now: s.phase.startedAt + 400, action: 'resume' });
    expect(s.phase.id).toBe('open');
  });
});

describe('review C4: the rules give up at exactly 10 minutes', () => {
  it('the re-armed net never runs past startedAt + 10 min', () => {
    let s = ready(start(3), 'p1');
    const cap = s.phase.startedAt + 600_000;
    for (let i = 0; i < 6 && s.rulesStep === 0; i++) {
      expect(s.phase.deadline ?? 0).toBeLessThanOrEqual(cap);
      s = timer(s);
    }
    expect(s.rulesStep).toBe(1);
  });
});
