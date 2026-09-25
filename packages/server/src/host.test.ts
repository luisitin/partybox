// Host with a fake transport and a frozen clock: timers, pushes, effects — no sockets involved.
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GameDefinition, GameStateBase } from '@partybox/shared';
import { seedRng, z } from '@partybox/shared';
import { createBotManager } from './bots';
import { createClock } from './clock';
import { createHost } from './host';
import type { Transport } from './host';
import { createRateLimiter, jsonBytes } from './rate-limit';

interface S extends GameStateBase {
  hits: number;
}

/** play (5 s) → done; any input counts a hit. */
const tiny: GameDefinition<S, { hit: true }> = {
  manifest: {
    id: 'tiny',
    name: 'Tiny',
    icon: '🎲',
    tagline: 't',
    howToPlay: ['a', 'b', 'c'],
    presence: { needs: 'anywhere' },
    addedOn: '2026-01-01',
    description: 'd',
    version: '1.0.0',
    minPlayers: 1,
    maxPlayers: 8,
    estimatedMinutes: 1,
    tags: ['words'],
    settings: [],
    supportsBots: true,
  },
  phases: ['play', 'done'],
  inputSchema: z.object({ hit: z.literal(true) }),
  init: (ctx) => ({
    phase: { id: 'play', startedAt: ctx.now, deadline: ctx.now + 5000 },
    rng: seedRng(ctx.seed),
    players: Object.fromEntries(ctx.players.map((p) => [p.id, p])),
    hits: 0,
  }),
  reduce: (s, e) => {
    if (e.type === 'timer' || (e.type === 'vip' && (e.action === 'skip' || e.action === 'end')))
      return { ...s, phase: { id: 'done', startedAt: e.now, deadline: null } };
    if (e.type === 'input' && s.phase.id === 'play') return { ...s, hits: s.hits + 1 };
    return s;
  },
  tvView: (s) => ({
    gameId: 'tiny',
    phaseId: s.phase.id,
    deadline: s.phase.deadline,
    paused: false,
    players: [],
  }),
  controllerView: (s, id) => ({
    gameId: 'tiny',
    phaseId: s.phase.id,
    deadline: s.phase.deadline,
    paused: false,
    players: [],
    me: { id, role: 'player' },
  }),
  results: (s) =>
    s.phase.id === 'done' ? { scores: {}, ranking: [], winnerIds: [], awards: [] } : null,
  bot: { sampleInput: (s) => (s.phase.id === 'play' ? { hit: true } : null) },
};

function fakeTransport(): Transport & { sent: { to: string; event: string; payload: unknown }[] } {
  const sent: { to: string; event: string; payload: unknown }[] = [];
  return {
    sent,
    toPlayer: (to, event, payload) => void sent.push({ to, event, payload }),
    toTvs: (code, event, payload) => void sent.push({ to: `tv:${code}`, event, payload }),
    toAll: (code, event, payload) => void sent.push({ to: `all:${code}`, event, payload }),
    disconnectPlayer: (to) => void sent.push({ to, event: 'disconnect', payload: null }),
  };
}

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
    host.dispatch(code, { type: 'vip', playerId: 'a', action: { action: 'startNow' }, seed: 1 });
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
    host.dispatch(code, { type: 'vip', playerId: 'a', action: { action: 'startNow' }, seed: 1 });
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
    host.dispatch(code, { type: 'vip', playerId: 'a', action: { action: 'startNow' }, seed: 1 });
    await vi.advanceTimersByTimeAsync(400);
    expect((host.house().game?.state as S).hits).toBeGreaterThanOrEqual(3);
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
    host.dispatch(code, { type: 'vip', playerId: 'a', action: { action: 'startNow' }, seed: 1 });
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

describe('I-658: a start over keeps the old codes working for a while', () => {
  it('an old code leads to the new house room for 10 minutes, then nowhere', async () => {
    const { RETIRED_ALIAS_MS } = await import('./host');
    const clock = createClock();
    clock.freeze(1_000_000);
    const host = createHost({
      deps: { games: { tiny } },
      clock,
      transport: fakeTransport(),
      log: () => {},
    });
    const old = host.house().code;
    expect(host.aliasOf(old)).toBeUndefined();
    host.reset();
    const fresh = host.house().code;
    expect(fresh).not.toBe(old);
    expect(host.aliasOf(old)).toBe(fresh);
    clock.set(1_000_000 + RETIRED_ALIAS_MS + 1);
    expect(host.aliasOf(old)).toBeUndefined();
    expect(host.aliasOf('ZZZZ')).toBeUndefined();
    host.close();
  });
});
