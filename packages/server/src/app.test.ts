// Boots the real server on port 0 (API + sockets, no client) and drives it with socket.io-client.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as connect } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { ErrorPayload, RoomPush, WelcomePayload } from '@partybox/shared';
import { createApp } from './app';
import type { App } from './app';
import { createClock } from './clock';

let app: App;
let url: string;
const sockets: Socket[] = [];

function client(): Socket {
  const s = connect(url, { transports: ['websocket'], forceNew: true });
  sockets.push(s);
  return s;
}

function once<T>(socket: Socket, event: string): Promise<T> {
  return new Promise((resolve) => socket.once(event, (payload: T) => resolve(payload)));
}

async function join(socket: Socket, name: string, token?: string): Promise<WelcomePayload> {
  const welcome = once<WelcomePayload>(socket, 'welcome');
  socket.emit('join', { name, avatarId: 'fox', token });
  return welcome;
}

beforeAll(async () => {
  app = await createApp({
    port: 0,
    dev: false,
    devApi: true,
    clock: createClock(),
    quiet: true,
    serveClient: false,
    publicHost: '127.0.0.1',
  });
  await app.listen();
  url = `http://127.0.0.1:${app.port}`;
});

afterAll(async () => {
  for (const s of sockets) s.disconnect();
  await app.close();
});

describe('http', () => {
  it('/healthz and /api/info', async () => {
    const health = await (await fetch(`${url}/healthz`)).json();
    expect(health).toMatchObject({ ok: true, rooms: 1 });
    const info = await (await fetch(`${url}/api/info`)).json();
    expect(info.joinUrl).toBe(`http://127.0.0.1:${app.port}/`);
    expect(info.qrSvg).toContain('<svg');
    expect(info.houseRoom).toMatch(/^[A-Z]{4}$/);
  });

  it('dev api answers 403 when disabled', async () => {
    const off = await createApp({
      port: 0,
      dev: false,
      devApi: false,
      quiet: true,
      serveClient: false,
      publicHost: '127.0.0.1',
    });
    await off.listen();
    const res = await fetch(`http://127.0.0.1:${off.port}/api/dev/state`);
    expect(res.status).toBe(403);
    await off.close();
  });

  it('dev api: reset, bots, state, clock', async () => {
    const reset = await (await fetch(`${url}/api/dev/reset`, { method: 'POST' })).json();
    expect(reset.ok).toBe(true);
    const bots = await (
      await fetch(`${url}/api/dev/bots`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ count: 2 }),
      })
    ).json();
    expect(bots.playerIds).toHaveLength(2);
    const state = await (await fetch(`${url}/api/dev/state`)).json();
    expect(Object.keys(state.room.players)).toHaveLength(2);
    expect(state.bots).toHaveLength(2);
    const frozen = await (
      await fetch(`${url}/api/dev/clock`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ freeze: true, now: 5 }),
      })
    ).json();
    expect(frozen).toMatchObject({ frozen: true, now: 5 });
    const bad = await fetch(`${url}/api/dev/bots`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ count: 99 }),
    });
    expect(bad.status).toBe(400);
    const noGame = await fetch(`${url}/api/dev/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gameId: 'nope' }),
    });
    expect(noGame.status).toBe(404);
    await fetch(`${url}/api/dev/reset`, { method: 'POST' });
  });
});

describe('sockets', () => {
  it('first joiner is VIP, second gets a room push, duplicate names are rejected', async () => {
    await fetch(`${url}/api/dev/reset`, { method: 'POST' });
    const a = client();
    const welcomeA = await join(a, 'Ana');
    expect(welcomeA.room.vip).toBe(welcomeA.playerId);
    expect(welcomeA.token).toHaveLength(48);
    const b = client();
    const pushToA = once<RoomPush>(a, 'room');
    const welcomeB = await join(b, 'Ben');
    expect(welcomeB.room.players.map((p) => p.name)).toEqual(['Ana', 'Ben']);
    expect((await pushToA).room.players).toHaveLength(2);
    const c = client();
    const err = once<ErrorPayload>(c, 'error');
    c.emit('join', { name: 'ana', avatarId: 'owl' });
    expect((await err).code).toBe('name_taken');
    const bad = once<ErrorPayload>(c, 'error');
    c.emit('join', { nope: 1 });
    expect((await bad).code).toBe('invalid_payload');
  });

  it('input outside a game and VIP actions from non-VIPs are rejected', async () => {
    await fetch(`${url}/api/dev/reset`, { method: 'POST' });
    const a = client();
    await join(a, 'Ana');
    const b = client();
    await join(b, 'Ben');
    const notPlaying = once<ErrorPayload>(a, 'error');
    a.emit('input', { seq: 1, input: { x: 1 } });
    expect((await notPlaying).code).toBe('not_playing');
    const notVip = once<ErrorPayload>(b, 'error');
    b.emit('vip', { action: 'lock' });
    expect((await notVip).code).toBe('not_vip');
    const anon = client();
    const noRoom = once<ErrorPayload>(anon, 'error');
    anon.emit('input', { seq: 1, input: {} });
    expect((await noRoom).code).toBe('not_in_room');
  });

  it('rate limits a flood of inputs', async () => {
    await fetch(`${url}/api/dev/reset`, { method: 'POST' });
    const a = client();
    await join(a, 'Ana');
    const codes: string[] = [];
    a.on('error', (e: ErrorPayload) => codes.push(e.code));
    for (let i = 0; i < 40; i++) a.emit('input', { seq: i, input: {} });
    await new Promise((r) => setTimeout(r, 300));
    expect(codes).toContain('rate_limited');
  });

  it('a token resumes the same player after a drop; a TV sees the room', async () => {
    await fetch(`${url}/api/dev/reset`, { method: 'POST' });
    const a = client();
    const welcome = await join(a, 'Ana');
    const tv = client();
    const tvRoom = once<RoomPush>(tv, 'room');
    tv.emit('tv:join', {});
    expect((await tvRoom).room.players[0]?.name).toBe('Ana');
    const dropped = once<RoomPush>(tv, 'room');
    a.disconnect();
    expect((await dropped).room.players[0]?.connected).toBe(false);
    const again = client();
    const resumed = await join(again, 'ignored', welcome.token);
    expect(resumed.playerId).toBe(welcome.playerId);
    expect(resumed.room.players[0]).toMatchObject({ name: 'Ana', connected: true, isVip: true });
  });

  it('the TV is the host (ADR-031): tv:bot adds bots, tv:vip picks, starts and ends a game with no VIP phone', async () => {
    await fetch(`${url}/api/dev/reset`, { method: 'POST' });
    const tv = client();
    const joined = once<RoomPush>(tv, 'room');
    tv.emit('tv:join', {});
    await joined;
    // A phone-less room: three bots from the TV, then Bingo (bots welcome) from the TV.
    for (let i = 0; i < 3; i++) tv.emit('tv:bot', { action: 'add' });
    await new Promise((r) => setTimeout(r, 80));
    expect(Object.values(app.host.house().players).filter((p) => p.bot)).toHaveLength(3);
    expect(app.host.house().vipId).toBeNull();
    tv.emit('tv:vip', { action: 'selectGame', gameId: 'bingo' });
    tv.emit('tv:vip', { action: 'updateSettings', settings: { rounds: 1, callSeconds: 3 } });
    tv.emit('tv:vip', { action: 'start' });
    await new Promise((r) => setTimeout(r, 120));
    expect(app.host.house().status).toBe('playing');
    expect(app.host.house().settings['rounds']).toBe(1);
    // Refusals come back to the TV as errors (a TV cannot start twice).
    const refused = once<ErrorPayload>(tv, 'error');
    tv.emit('tv:vip', { action: 'start' });
    expect((await refused).code).toBe('cannot_start');
    tv.emit('tv:vip', { action: 'end' });
    tv.emit('tv:vip', { action: 'toLobby' });
    await new Promise((r) => setTimeout(r, 120));
    expect(app.host.house().status).toBe('lobby');
    // A phone that is not the VIP still cannot use the host channel.
    const phone = client();
    await join(phone, 'Ana');
    const b = client();
    await join(b, 'Ben');
    const denied = once<ErrorPayload>(b, 'error');
    b.emit('tv:vip', { action: 'lock' });
    expect((await denied).code).toBe('not_in_room');
    expect(app.host.house().locked).toBe(false);
  });

  it('kick disconnects the target and leave removes immediately', async () => {
    await fetch(`${url}/api/dev/reset`, { method: 'POST' });
    const a = client();
    const welcomeA = await join(a, 'Ana');
    const b = client();
    const welcomeB = await join(b, 'Ben');
    const kicked = once<{ reason: string }>(b, 'kicked');
    a.emit('vip', { action: 'kick', playerId: welcomeB.playerId });
    expect((await kicked).reason).toContain('VIP');
    await new Promise((r) => setTimeout(r, 50));
    expect(Object.keys(app.host.house().players)).toEqual([welcomeA.playerId]);
    a.emit('leave', {});
    await new Promise((r) => setTimeout(r, 50));
    expect(Object.keys(app.host.house().players)).toEqual([]);
  });
});
