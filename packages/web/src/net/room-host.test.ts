// The room hosted in a browser tab, driven the way two phones drive it: join, pick a game, play.
// No PeerJS here — a data channel and the host's own loopback are the same two-way shape, so the
// loopback exercises everything but the WebRTC plumbing.
import { describe, expect, it } from 'vitest';
import type { GameDefinition, GameStateBase } from '@partybox/shared';
import { seedRng, z } from '@partybox/shared';
import { createRoomHost } from './room-host';
import { TV_PREFIX, createLoopbackLink } from './wire';

interface CountState extends GameStateBase {
  hits: number;
}

const counter: GameDefinition<CountState, { hit: true }> = {
  manifest: {
    id: 'counter',
    name: 'Counter',
    tagline: 't',
    description: 'd',
    version: '1.0.0',
    minPlayers: 1,
    maxPlayers: 8,
    estimatedMinutes: 1,
    tags: [],
    settings: [],
    supportsBots: true,
  },
  phases: ['play', 'done'],
  inputSchema: z.object({ hit: z.literal(true) }),
  init: (ctx) => ({
    phase: { id: 'play', startedAt: ctx.now, deadline: ctx.now + 60_000 },
    rng: seedRng(ctx.seed),
    players: Object.fromEntries(ctx.players.map((p) => [p.id, p])),
    hits: 0,
  }),
  reduce: (s, e) => {
    if (e.type === 'input' && s.phase.id === 'play') return { ...s, hits: s.hits + 1 };
    if (e.type === 'timer' || (e.type === 'vip' && (e.action === 'skip' || e.action === 'end')))
      return { ...s, phase: { id: 'done', startedAt: e.now, deadline: null } };
    return s;
  },
  tvView: (s) => ({
    gameId: 'counter',
    phaseId: s.phase.id,
    deadline: s.phase.deadline,
    paused: false,
    players: [],
    hits: s.hits,
  }),
  controllerView: (s, id) => ({
    gameId: 'counter',
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

/** One device: the phone half and the stage half of the same data channel. */
function device(
  room: ReturnType<typeof createRoomHost>,
  id: string,
): {
  send(event: string, payload: unknown): void;
  phone: { event: string; payload: unknown }[];
  stage: { event: string; payload: unknown }[];
  detach(): void;
} {
  const phone: { event: string; payload: unknown }[] = [];
  const stage: { event: string; payload: unknown }[] = [];
  const session = room.attach({
    id,
    send: (event, payload) =>
      void (event.startsWith(TV_PREFIX)
        ? stage.push({ event: event.slice(TV_PREFIX.length), payload })
        : phone.push({ event, payload })),
    close: () => undefined,
  });
  return {
    send: (event, payload) => session.receive(event, payload),
    phone,
    stage,
    detach: session.detach,
  };
}

describe('a room hosted in the browser', () => {
  it('makes the first player the VIP and lets them hand it over', () => {
    const room = createRoomHost({ games: { counter } });
    const ana = device(room, 'ana');
    const ben = device(room, 'ben');
    ana.send('join', { name: 'Ana', avatarId: 'fox' });
    ben.send('join', { name: 'Ben', avatarId: 'owl' });
    const anaId = (ana.phone.find((f) => f.event === 'welcome')?.payload as { playerId: string })
      .playerId;
    const benId = (ben.phone.find((f) => f.event === 'welcome')?.payload as { playerId: string })
      .playerId;
    expect(room.host.get(room.code)?.vipId).toBe(anaId);

    // A non-VIP cannot start anything…
    ben.send('vip', { action: 'selectGame', gameId: 'counter' });
    expect(room.host.get(room.code)?.selectedGameId).toBeNull();
    // …until the VIP hands it over, which is the whole point of the button.
    ana.send('vip', { action: 'transferVip', playerId: benId });
    expect(room.host.get(room.code)?.vipId).toBe(benId);
    ben.send('vip', { action: 'selectGame', gameId: 'counter' });
    expect(room.host.get(room.code)?.selectedGameId).toBe('counter');
    room.close();
  });

  it('pushes the stage to every device, not to a TV', () => {
    const room = createRoomHost({ games: { counter } });
    const ana = device(room, 'ana');
    const ben = device(room, 'ben');
    ana.send('join', { name: 'Ana', avatarId: 'fox' });
    ben.send('join', { name: 'Ben', avatarId: 'owl' });
    ana.send('vip', { action: 'selectGame', gameId: 'counter' });
    ana.send('vip', { action: 'start' });
    // Both halves of both devices are live: the phone gets its controller view, the same device's
    // stage gets the view a TV would have shown.
    for (const who of [ana, ben]) {
      expect(who.phone.filter((f) => f.event === 'view').length).toBeGreaterThan(0);
      expect(who.stage.filter((f) => f.event === 'view').length).toBeGreaterThan(0);
    }
    ben.send('input', { seq: 1, input: { hit: true } });
    expect((room.host.get(room.code)?.game?.state as CountState).hits).toBe(1);
    expect(ben.phone.some((f) => f.event === 'ack')).toBe(true);
    room.close();
  });

  it('refuses junk and over-large input instead of throwing', () => {
    const room = createRoomHost({ games: { counter } });
    const ana = device(room, 'ana');
    ana.send('input', { seq: 1, input: { hit: true } });
    expect(ana.phone.at(-1)).toMatchObject({ event: 'error', payload: { code: 'not_in_room' } });
    ana.send('join', { name: '', avatarId: 'fox' });
    expect(ana.phone.at(-1)).toMatchObject({ event: 'error', payload: { code: 'name_invalid' } });
    ana.send('join', 'not even an object');
    expect(ana.phone.at(-1)).toMatchObject({
      event: 'error',
      payload: { code: 'invalid_payload' },
    });
    ana.send('join', { name: 'Ana', avatarId: 'fox' });
    ana.send('vip', { action: 'selectGame', gameId: 'counter' });
    ana.send('vip', { action: 'start' });
    ana.send('input', { seq: 2, input: { hit: true, pad: 'x'.repeat(20_000) } });
    expect(ana.phone.at(-1)).toMatchObject({ event: 'error' });
    room.close();
  });

  it('holds a seat when a device drops and gives it back on the same token', () => {
    const room = createRoomHost({ games: { counter } });
    const ana = device(room, 'ana');
    ana.send('join', { name: 'Ana', avatarId: 'fox' });
    const welcome = ana.phone.find((f) => f.event === 'welcome')?.payload as {
      playerId: string;
      token: string;
    };
    ana.detach();
    expect(room.host.get(room.code)?.players[welcome.playerId]?.connected).toBe(false);
    const again = device(room, 'ana-2');
    again.send('join', { name: 'Ana', avatarId: 'fox', token: welcome.token });
    expect(
      (again.phone.find((f) => f.event === 'welcome')?.payload as { playerId: string }).playerId,
    ).toBe(welcome.playerId);
    expect(room.host.get(room.code)?.players[welcome.playerId]?.connected).toBe(true);
    room.close();
  });

  it('the loopback link carries messages both ways', async () => {
    const { client, server } = createLoopbackLink();
    const heard: string[] = [];
    server.onMessage((event) => heard.push(`up:${event}`));
    client.onMessage((event) => heard.push(`down:${event}`));
    client.send('join', {});
    server.send('welcome', {});
    await new Promise((resolve) => queueMicrotask(() => resolve(null)));
    expect(heard).toEqual(['up:join', 'down:welcome']);
  });
});
