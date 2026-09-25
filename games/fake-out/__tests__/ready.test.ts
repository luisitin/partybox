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
    expect(s.counting).toBe(false);
    expect(tv(s).ready).toEqual(ids.slice(0, 2));
    expect(cv(s, ids[0] as string).meReady).toBe(true);
    expect(cv(s, ids[2] as string).meReady).toBe(false);
    const at = s.phase.startedAt + 4_000;
    s = ready(s, ids[2] as string, at);
    expect(s.counting).toBe(true);
    expect(s.phase.deadline).toBe(at + READY_BREATH_MS + COUNTDOWN_MS);
    expect(tv(s).goAt).toBe(s.phase.deadline);
    s = timer(s);
    expect(s.phase.id).toBe('question');
  });

  it('a ready twice counts once; a dropped phone never blocks', () => {
    let s = start({ fact: PENGUIN, players: 3 });
    const [a, b, c] = PLAYERS.slice(0, 3).map((p) => p.id) as [string, string, string];
    s = ready(ready(s, a), a);
    expect(s.ready).toEqual([a]);
    s = ready(s, b);
    expect(s.counting).toBe(false);
    s = connect(s, c, false);
    expect(s.counting).toBe(true);
  });

  it('the VIP Start now counts down at once; the timer never shows', () => {
    let s = start({ fact: PENGUIN, players: 3 });
    expect(tv(s).timerMode).toBe('hidden');
    s = vip(s, 'skip');
    expect(s.phase.id).toBe('intro');
    expect(s.counting).toBe(true);
  });
});

describe('intro ready-up: pause and drops', () => {
  it('a pause during the 3 · 2 · 1 moves the count with it (TV and phones)', () => {
    let s = start({ fact: PENGUIN, players: 3 });
    s = vip(s, 'skip');
    const end = s.phase.deadline ?? 0;
    const at = s.phase.startedAt + 1_000;
    s = vip(s, 'pause', at);
    s = vip(s, 'resume', at + 5_000);
    expect(s.phase.deadline).toBe(end + 5_000);
    expect(tv(s).goAt).toBe(end + 5_000);
    expect(cv(s, PLAYERS[0]?.id ?? '').goAt).toBe(end + 5_000);
  });

  it('a ready player who drops leaves the count (never 3 / 2 ready)', () => {
    let s = start({ fact: PENGUIN, players: 3 });
    const [a] = PLAYERS.slice(0, 3).map((p) => p.id) as [string];
    s = ready(s, a);
    s = connect(s, a, false);
    const view = tv(s);
    expect(view.inCount).toBeLessThanOrEqual(view.expected);
    expect(view.inCount).toBe(0);
  });
});
