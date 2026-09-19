// Host with a fake transport and a frozen clock: timers, pushes, effects — no sockets involved.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createClock } from './clock';
import { createHost } from './host';
import { fakeTransport, tiny } from './tiny-game.helper';

afterEach(() => vi.useRealTimers());

describe('host', () => {
  it('runs a game to the deadline with a real timer', async () => {
    vi.useFakeTimers();
    const clock = createClock();
    const transport = fakeTransport();
    const host = createHost({ deps: { games: { tiny } }, clock, transport, log: () => {} });
    const code = host.house().code;
    host.dispatch(code, { type: 'join', playerId: 'a', token: 'ta', name: 'Ana', avatarId: 'fox' });
    host.dispatch(code, {
      type: 'vip',
      playerId: 'a',
      action: { action: 'selectGame', gameId: 'tiny' },
    });
    host.dispatch(code, { type: 'vip', playerId: 'a', action: { action: 'start' }, seed: 1 });
    expect(host.house().status).toBe('playing');
    expect(transport.sent.filter((s) => s.event === 'view' && s.to === 'a')).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(4999);
    expect(host.house().status).toBe('playing');
    await vi.advanceTimersByTimeAsync(2);
    expect(host.house().status).toBe('results');
    host.close();
  });

  it('a frozen clock holds timers until time is set forward', () => {
    vi.useFakeTimers();
    const clock = createClock();
    clock.freeze(1_000_000);
    const transport = fakeTransport();
    const host = createHost({ deps: { games: { tiny } }, clock, transport, log: () => {} });
    const code = host.house().code;
    host.dispatch(code, { type: 'join', playerId: 'a', token: 'ta', name: 'Ana', avatarId: 'fox' });
    host.dispatch(code, {
      type: 'vip',
      playerId: 'a',
      action: { action: 'selectGame', gameId: 'tiny' },
    });
    host.dispatch(code, { type: 'vip', playerId: 'a', action: { action: 'start' }, seed: 1 });
    vi.advanceTimersByTime(60_000);
    expect(host.house().status).toBe('playing');
    clock.set(1_005_000);
    expect(host.house().status).toBe('results');
    host.close();
  });

  it('effects map to transport calls; reset drops rooms', () => {
    const clock = createClock();
    const transport = fakeTransport();
    const host = createHost({ deps: { games: { tiny } }, clock, transport, log: () => {} });
    const code = host.house().code;
    host.dispatch(code, { type: 'join', playerId: 'a', token: 'ta', name: 'Ana', avatarId: 'fox' });
    host.dispatch(code, { type: 'join', playerId: 'b', token: 'tb', name: 'Ben', avatarId: 'owl' });
    host.dispatch(code, { type: 'vip', playerId: 'a', action: { action: 'kick', playerId: 'b' } });
    const events = transport.sent.map((s) => `${s.event}>${s.to}`);
    expect(events).toContain('welcome>a');
    expect(events).toContain('kicked>b');
    expect(events).toContain('disconnect>b');
    expect(events).toContain(`toast>all:${code}`);
    host.dispatch(code, { type: 'vip', playerId: 'b', action: { action: 'lock' } });
    expect(transport.sent.at(-1)).toMatchObject({ event: 'error', to: 'b' });
    expect(host.dispatch('ZZZZ', { type: 'tick' })).toBeUndefined();
    host.resend(code);
    expect(transport.sent.at(-1)).toMatchObject({ event: 'room', to: `tv:${code}` });
    host.resend(code, 'a');
    expect(transport.sent.at(-1)).toMatchObject({ event: 'room', to: 'a' });
    const second = host.createRoom();
    expect(host.rooms()).toHaveLength(2);
    expect(second.code).not.toBe(code);
    host.reset();
    expect(host.rooms()).toHaveLength(1);
    expect(host.house().players).toEqual({});
    host.close();
  });
});

describe('TV view pushes', () => {
  it('skips the TV when a push leaves its view unchanged, and sends again once it changes', () => {
    const clock = createClock();
    const transport = fakeTransport();
    const host = createHost({ deps: { games: { tiny } }, clock, transport, log: () => {} });
    const code = host.house().code;
    host.dispatch(code, { type: 'join', playerId: 'a', token: 'ta', name: 'Ana', avatarId: 'fox' });
    host.dispatch(code, {
      type: 'vip',
      playerId: 'a',
      action: { action: 'selectGame', gameId: 'tiny' },
    });
    host.dispatch(code, { type: 'vip', playerId: 'a', action: { action: 'start' }, seed: 1 });
    const tvViews = (): number =>
      transport.sent.filter((s) => s.event === 'view' && s.to === `tv:${code}`).length;
    expect(tvViews()).toBe(1);
    // A phone input the TV view does not reflect (tiny's TV shows only the phase): the room
    // pushes, the TV view does not.
    host.dispatch(code, { type: 'input', playerId: 'a', input: { hit: true } });
    expect(host.house().game?.state).toMatchObject({ hits: 1 });
    expect(tvViews()).toBe(1);
    // A late TV still gets the full view on demand.
    host.resend(code);
    expect(tvViews()).toBe(2);
    host.close();
  });
});
