// The rules and the ready-up (the owner, 2026-09-24): everyone reads, taps Ready, then 3·2·1.
import { describe, expect, it } from 'vitest';
import { game } from '../server/index';
import { COUNTDOWN_MS, RULES_MS } from '../server/timing';
import { ready, send, skip, start, timer } from './helpers';

describe('rules and ready-up', () => {
  it('opens on the rules; bots are ready from the start', () => {
    const s = start(4, {}, 1, 2);
    expect(s.phase.id).toBe('rules');
    expect(s.phase.deadline).toBe(s.phase.startedAt + RULES_MS);
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

  it('never waits forever: the deadline starts the countdown with whoever is ready', () => {
    let s = start(3);
    s = ready(s, 'p1');
    s = timer(s);
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

  it('the VIP skip goes straight to the first box', () => {
    expect(skip(start(3)).phase.id).toBe('box');
  });
});
