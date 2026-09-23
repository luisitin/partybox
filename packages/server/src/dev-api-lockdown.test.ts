// I-753: the developer API does not hand out login tokens, answers only the host PC.
import { networkInterfaces } from 'node:os';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as connect } from 'socket.io-client';
import { createApp } from './app';
import type { App } from './app';
import { createClock } from './clock';

let app: App;
let url: string;
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
  await app.close();
});

describe('I-753: the developer API is locked down', () => {
  it('state carries no login tokens', async () => {
    const s = connect(url, { transports: ['websocket'], forceNew: true });
    await new Promise<void>((r) => {
      s.once('welcome', () => r());
      s.emit('join', { name: 'Ana', avatarId: 'fox' });
    });
    const state = (await (await fetch(`${url}/api/dev/state`)).json()) as {
      room: { players: Record<string, { token: string }> };
    };
    for (const p of Object.values(state.room.players)) expect(p.token).toBe('');
    s.disconnect();
  });

  it('a phone on the network gets 403 (the host PC does not)', async () => {
    const lan = Object.values(networkInterfaces())
      .flat()
      .find((a) => a && a.family === 'IPv4' && !a.internal);
    if (!lan) return; // no network card on this machine: nothing to test
    const remote = await fetch(`http://${lan.address}:${app.port}/api/dev/state`);
    expect(remote.status).toBe(403);
    const home = await fetch(`http://${lan.address}:${app.port}/api/dev/reset`, { method: 'POST' });
    expect(home.status).toBe(200); // the TV's 🏠 still works from another device
  });

  it('a request relayed by the Cloudflare tunnel is not the host PC', async () => {
    const relayed = await fetch(`${url}/api/dev/state`, {
      headers: { 'cf-connecting-ip': '203.0.113.9' },
    });
    expect(relayed.status).toBe(403);
    expect((await fetch(`${url}/api/dev/state`)).status).toBe(200);
  });

  it('C: a socket opened by another website is refused; one from this host connects', async () => {
    const open = (origin: string): Promise<string> =>
      new Promise((r) => {
        const s = connect(url, {
          transports: ['websocket'],
          forceNew: true,
          reconnection: false,
          extraHeaders: { origin },
        });
        s.once('connect', () => {
          s.disconnect();
          r('connected');
        });
        s.once('connect_error', () => r('refused'));
      });
    expect(await open('http://evil.example')).toBe('refused');
    expect(await open(url)).toBe('connected');
  });
});
