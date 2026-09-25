// Intro ready-up + 3 · 2 · 1 (owner, [cc45f4]): the rules wait for every connected phone.
import { describe, expect, it } from 'vitest';
import { COUNTDOWN_MS, READY_BREATH_MS } from '../server/types';
import { PENGUIN, PLAYERS, connect, cv, input, start, timer, tv, vip } from './helpers';

const ready = (s: ReturnType<typeof start>, p: string, now?: number) =>
  input(s, p, { type: 'ready' }, now);

describe('intro ready-up', () => {
  it('waits for every phone, then counts 3 · 2 · 1 into question 1', () => {
    let s = start({ fact: PENGUIN, players: 3 });
    const ids = PLAYERS.slice(0, 3).map((p) => p.id);
    for (const id of ids.slice(0, 2)) s = ready(s, id);
    expect(s.goAt).toBeNull();
    expect(tv(s).ready).toEqual(ids.slice(0, 2));
    expect(cv(s, ids[0] as string).meReady).toBe(true);
    expect(cv(s, ids[2] as string).meReady).toBe(false);
    const at = s.phase.startedAt + 4_000;
    s = ready(s, ids[2] as string, at);
    expect(s.goAt).toBe(at + READY_BREATH_MS + COUNTDOWN_MS);
    expect(s.phase.deadline).toBe(s.goAt);
    expect(tv(s).goAt).toBe(s.goAt);
    s = timer(s);
    expect(s.phase.id).toBe('question');
  });

  it('a ready twice counts once; a dropped phone never blocks', () => {
    let s = start({ fact: PENGUIN, players: 3 });
    const [a, b, c] = PLAYERS.slice(0, 3).map((p) => p.id) as [string, string, string];
    s = ready(ready(s, a), a);
    expect(s.ready).toEqual([a]);
    s = ready(s, b);
    expect(s.goAt).toBeNull();
    s = connect(s, c, false);
    expect(s.goAt).not.toBeNull();
  });

  it('the VIP Start now counts down at once; the timer never shows', () => {
    let s = start({ fact: PENGUIN, players: 3 });
    expect(tv(s).timerMode).toBe('hidden');
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('intro');
    expect(s.goAt).not.toBeNull();
  });
});
