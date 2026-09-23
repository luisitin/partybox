// I-785: a private room's code must not appear in the public /api/info (unless asked for by code).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
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

describe('I-785: private rooms stay private', () => {
  it('a private room is not published, but can be looked up by its code', async () => {
    const made = await fetch(`${url}/api/rooms`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'PQRS', listed: false }),
    });
    expect(made.ok).toBe(true);
    const open = await (await fetch(`${url}/api/info`)).text();
    expect(open).not.toContain('PQRS');
    const asked = (await (await fetch(`${url}/api/info?room=PQRS`)).json()) as { rooms: { code: string }[] };
    expect(asked.rooms.map((r) => r.code)).toContain('PQRS');
  });
});
