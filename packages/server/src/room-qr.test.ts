// I-787: a second room's QR carries that room's code.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
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

describe('I-787: the QR belongs to the room', () => {
  it("asking for a room gives that room's QR; no room gives the house QR", async () => {
    await fetch(`${url}/api/rooms`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'TVBX' }),
    });
    const second = (await (await fetch(`${url}/api/info?room=TVBX`)).json()) as {
      qrUrl: string;
      houseRoom: string;
    };
    expect(second.qrUrl).toMatch(/\?room=TVBX$/);
    const house = (await (await fetch(`${url}/api/info`)).json()) as {
      qrUrl: string;
      houseRoom: string;
    };
    expect(house.qrUrl).toMatch(new RegExp(`\\?room=${house.houseRoom}$`));
  });
});
