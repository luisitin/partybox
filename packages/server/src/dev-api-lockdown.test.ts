// I-753: the developer API does not hand out login tokens.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as connect } from 'socket.io-client';
import { createApp } from './app';
import type { App } from './app';
import { createClock } from './clock';

let app: App;
let url: string;
beforeAll(async () => {
  app = await createApp({ port: 0, dev: false, devApi: true, clock: createClock(), quiet: true, serveClient: false, publicHost: '127.0.0.1' });
  await app.listen();
  url = `http://127.0.0.1:${app.port}`;
});
afterAll(async () => {
  await app.close();
});

describe('I-753: the developer API is locked down', () => {
  it('state carries no login tokens', async () => {
    const s = connect(url, { transports: ['websocket'], forceNew: true });
    await new Promise<void>((r) => { s.once('welcome', () => r()); s.emit('join', { name: 'Ana', avatarId: 'fox' }); });
    const state = (await (await fetch(`${url}/api/dev/state`)).json()) as { room: { players: Record<string, { token: string }> } };
    for (const p of Object.values(state.room.players)) expect(p.token).toBe('');
    s.disconnect();
  });
});
