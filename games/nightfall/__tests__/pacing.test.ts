// Pacing (#decisions cc45f4): the shell's start stage does rules + READY + 3 · 2 · 1; the roles
// phase then waits for every connected Got it with no visible clock. Bots are done at once, a
// dropped phone doesn't block, the hidden net never fires on someone still reading, and a resume
// re-checks what a pause held back (reviewer [12ea6b]).
import { describe, expect, it } from 'vitest';
import { READY_FALLBACK_MS } from '../server/types';
import { T0, input, phone, reduce, start, timer, toNight, tv, vip } from './helpers';

const IDS = ['ana', 'ben', 'cy', 'dee', 'eli', 'fay'];

describe('roles: every card read, then night', () => {
  it('waits for every Got it with no clock on screen, then night falls', () => {
    let s = start({ n: 6 });
    expect(JSON.parse(tv(s)).deadline).toBeNull();
    expect(phone(s, 'ana').deadline).toBeNull();
    for (const id of IDS.slice(0, 5)) s = input(s, id, { type: 'ready' }, T0 + 60_000);
    expect(s.phase.id).toBe('roles');
    s = input(s, 'fay', { type: 'ready' }, T0 + 90_000);
    expect(s.phase.id).toBe('night');
  });

  it('bots have read theirs from the start', () => {
    expect(start({ n: 6, bots: ['eli', 'fay'] }).ready).toEqual(['eli', 'fay']);
  });

  it('a dropped phone does not block the night', () => {
    let s = start({ n: 6 });
    for (const id of IDS.slice(0, 5)) s = input(s, id, { type: 'ready' });
    s = reduce(s, { type: 'player', now: T0 + 5000, playerId: 'fay', connected: false });
    expect(s.phase.id).toBe('night');
  });

  it('the ready count leaves out dropped phones', () => {
    let s = start({ n: 6 });
    s = input(s, 'ana', { type: 'ready' });
    s = reduce(s, { type: 'player', now: T0 + 5000, playerId: 'ana', connected: false });
    expect(phone(s, 'ben')).toMatchObject({ readyCount: 0, livingCount: 5 });
  });

  it('the hidden net starts an empty room, but re-arms while anyone is still reading', () => {
    expect(timer(start({ n: 6 })).phase.id).toBe('night');
    let s = start({ n: 6 });
    for (const id of IDS.slice(0, 5)) s = input(s, id, { type: 'ready' });
    s = timer(s);
    expect(s.phase.id).toBe('roles');
    expect(s.phase.deadline).toBe(T0 + READY_FALLBACK_MS * 2);
  });

  it('a drop during a pause is re-checked on resume', () => {
    let s = start({ n: 6 });
    for (const id of IDS.slice(0, 5)) s = input(s, id, { type: 'ready' }, T0 + 1000);
    s = vip(s, 'pause', T0 + 2000);
    s = reduce(s, { type: 'player', now: T0 + 3000, playerId: 'fay', connected: false });
    expect(s.phase.id).toBe('roles');
    s = vip(s, 'resume', T0 + 7000);
    expect(s.phase.id).toBe('night');
  });

  it('night: the last picker dropping during a pause is re-checked on resume', () => {
    let s = toNight(start({ n: 6 }));
    const now = s.phase.startedAt;
    for (const id of IDS.slice(0, 5))
      s = input(s, id, { type: 'night', target: id === 'ana' ? 'ben' : 'ana' }, now + 1000);
    expect(s.phase.id).toBe('night');
    s = vip(s, 'pause', now + 2000);
    s = reduce(s, { type: 'player', now: now + 3000, playerId: 'fay', connected: false });
    s = vip(s, 'resume', now + 6000);
    expect(s.phase.id).toBe('dawn');
  });
});
