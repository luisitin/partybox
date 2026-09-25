// The owner's pacing rule (#decisions cc45f4): rules + ready-up with no clock, then 3 · 2 · 1,
// then the first night. Bots are ready from the start; a dropped phone doesn't block.
import { describe, expect, it } from 'vitest';
import { COUNTDOWN_MS, READY_BREATH_MS } from '../server/types';
import { T0, input, phone, reduce, start, timer, tv, vip } from './helpers';

const IDS = ['ana', 'ben', 'cy', 'dee', 'eli', 'fay'];

describe('ready-up and 3 · 2 · 1', () => {
  it('waits for every Ready with no clock, then counts down, then night falls', () => {
    let s = start({ n: 6 });
    expect(s.phase.id).toBe('roles');
    expect(JSON.parse(tv(s)).deadline).toBeNull();
    expect(phone(s, 'ana').deadline).toBeNull();
    for (const id of IDS.slice(0, 5)) s = input(s, id, { type: 'ready' }, T0 + 60_000);
    expect(s.step).toBe(0);
    s = input(s, 'fay', { type: 'ready' }, T0 + 90_000);
    expect(s.step).toBe(1);
    expect(s.phase.deadline).toBe(T0 + 90_000 + READY_BREATH_MS + COUNTDOWN_MS);
    expect(JSON.parse(tv(s)).deadline).toBeNull();
    expect(JSON.parse(tv(s)).countEnd).toBe(s.phase.deadline);
    expect(phone(s, 'ana').countEnd).toBe(s.phase.deadline);
    expect(timer(s).phase.id).toBe('night');
  });

  it('an empty room (nobody taps) still starts the count after the fallback', () => {
    const s = timer(start({ n: 6 }));
    expect(s.phase.id).toBe('roles');
    expect(s.step).toBe(1);
  });

  it('bots are ready from the start', () => {
    const s = start({ n: 6, bots: ['eli', 'fay'] });
    expect(s.ready).toEqual(['eli', 'fay']);
  });

  it('a dropped phone does not block the count', () => {
    let s = start({ n: 6 });
    for (const id of IDS.slice(0, 5)) s = input(s, id, { type: 'ready' });
    s = reduce(s, { type: 'player', now: T0 + 5000, playerId: 'fay', connected: false });
    expect(s.step).toBe(1);
  });

  it('the ready count leaves out dropped phones', () => {
    let s = start({ n: 6 });
    s = input(s, 'ana', { type: 'ready' });
    s = reduce(s, { type: 'player', now: T0 + 5000, playerId: 'ana', connected: false });
    expect(phone(s, 'ben')).toMatchObject({ readyCount: 0, livingCount: 5 });
  });

  it('a pause during the 3 · 2 · 1 moves its end by the pause', () => {
    let s = start({ n: 6 });
    for (const id of IDS) s = input(s, id, { type: 'ready' }, T0 + 1000);
    const end = s.phase.deadline as number;
    s = vip(s, 'pause', T0 + 2000);
    s = vip(s, 'resume', T0 + 7000);
    expect(phone(s, 'ana').countEnd).toBe(end + 5000);
    expect(JSON.parse(tv(s)).countEnd).toBe(end + 5000);
  });

  it("the VIP's skip starts the count; a second skip ends it", () => {
    let s = start({ n: 6 });
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('roles');
    expect(s.step).toBe(1);
    expect(vip(s, 'skip').phase.id).toBe('night');
  });
});
