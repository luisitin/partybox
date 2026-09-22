// The owner (2026-09-22): "sometimes when I reconnect it just spams reconnecting". The watchdog
// could kill the fresh socket a second after every connect, forever.
import { describe, expect, it } from 'vitest';
import { createLinkWatch } from './link-watch';

describe('createLinkWatch', () => {
  const at = (t: { now: number }) => createLinkWatch(() => t.now);

  it('never goes stale right after a connect', () => {
    const t = { now: 1000 };
    const w = at(t);
    w.onConnect();
    t.now += 1000;
    expect(w.shouldGoStale(true, false)).toBe(false); // inside the 5 s grace
    t.now += 4500;
    expect(w.shouldGoStale(true, false)).toBe(true);
  });

  it('does not fire twice inside the cooldown — the flicker loop', () => {
    const t = { now: 0 };
    const w = at(t);
    t.now = 10_000;
    expect(w.shouldGoStale(true, false)).toBe(true);
    // the socket reconnects and the deadline is still in the past: the watchdog must hold off
    w.onConnect();
    for (let i = 0; i < 9; i++) {
      t.now += 1000;
      expect(w.shouldGoStale(true, false)).toBe(false);
    }
    t.now += 1000;
    expect(w.shouldGoStale(true, false)).toBe(true);
  });

  it('ignores a phone that is not in a room, or already reconnecting', () => {
    const t = { now: 100_000 };
    const w = at(t);
    expect(w.shouldGoStale(false, false)).toBe(false);
    expect(w.shouldGoStale(true, true)).toBe(false);
  });

  it('lets the browser\u2019s own offline event arm the cooldown', () => {
    const t = { now: 100_000 };
    const w = at(t);
    w.onOffline();
    t.now += 3000;
    expect(w.shouldGoStale(true, false)).toBe(false);
  });
});
