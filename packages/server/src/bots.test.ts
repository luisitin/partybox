// The server's bot manager driving the real host: bots join, answer on their own clock and go.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createClock, createHost, createRateLimiter, jsonBytes } from '@partybox/host';
import { fakeTransport, tiny } from '../../host/src/tiny-game.helper';
import type { TinyState } from '../../host/src/tiny-game.helper';
import { createBotManager } from './bots';

afterEach(() => vi.useRealTimers());

describe('bots', () => {
  it('bots join, answer and are removed', async () => {
    vi.useFakeTimers();
    const clock = createClock();
    const transport = fakeTransport();
    const host = createHost({ deps: { games: { tiny } }, clock, transport, log: () => {} });
    const bots = createBotManager(host, { games: { tiny } }, clock);
    const code = host.house().code;
    // Bots are never VIP: a human owns the room and starts the game.
    host.dispatch(code, { type: 'join', playerId: 'a', token: 'ta', name: 'Ana', avatarId: 'fox' });
    const ids = bots.add(code, 3, 'fast');
    expect(ids).toHaveLength(3);
    expect(bots.ids(code)).toEqual(ids);
    expect(host.house().vipId).toBe('a');
    host.dispatch(code, {
      type: 'vip',
      playerId: 'a',
      action: { action: 'selectGame', gameId: 'tiny' },
    });
    host.dispatch(code, { type: 'vip', playerId: 'a', action: { action: 'start' }, seed: 1 });
    await vi.advanceTimersByTimeAsync(400);
    expect((host.house().game?.state as TinyState).hits).toBeGreaterThanOrEqual(3);
    bots.removeAll(code);
    expect(Object.keys(host.house().players)).toEqual(['a']);
    expect(bots.add(code, 1, 'idle', 0)).toHaveLength(1);
    bots.close();
    host.close();
  });
});

describe('rate limiter + jsonBytes', () => {
  it('allows a burst then refills over time', () => {
    const limiter = createRateLimiter(10, 10);
    let t = 0;
    for (let i = 0; i < 10; i++) expect(limiter.take(1, t)).toBe(true);
    expect(limiter.take(1, t)).toBe(false);
    t += 500;
    expect(limiter.take(5, t)).toBe(true);
    expect(limiter.take(1, t)).toBe(false);
  });
  it('measures UTF-8 bytes and survives cycles', () => {
    expect(jsonBytes({ a: 'é' })).toBe(Buffer.byteLength('{"a":"é"}'));
    const cyc: Record<string, unknown> = {};
    cyc['self'] = cyc;
    expect(jsonBytes(cyc)).toBe(Number.POSITIVE_INFINITY);
  });
});
