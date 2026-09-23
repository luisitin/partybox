// I-741: resume-by-name end to end — a second phone joining under the name of a player whose phone
// dropped must get the welcome (and the seat's login), not the dead socket.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as connect } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { ErrorPayload, WelcomePayload } from '@partybox/shared';
import { createApp } from './app';
import type { App } from './app';
import { createClock } from './clock';

let app: App;
let url: string;
const sockets: Socket[] = [];
const client = (): Socket => {
  const s = connect(url, { transports: ['websocket'], forceNew: true });
  sockets.push(s);
  return s;
};

beforeAll(async () => {
  app = await createApp({ port: 0, dev: false, devApi: true, clock: createClock(), quiet: true, serveClient: false, publicHost: '127.0.0.1' });
  await app.listen();
  url = `http://127.0.0.1:${app.port}`;
});
afterAll(async () => {
  for (const s of sockets) s.disconnect();
  await app.close();
});

describe('I-741: resume by name', () => {
  it('a borrowed phone gets the seat of a player whose phone dropped', async () => {
    const sam = client();
    await new Promise<void>((r) => { sam.emit('join', { name: 'Sam', avatarId: 'fox' }); sam.once('welcome', () => r()); });
    const priya = client();
    const first = await new Promise<WelcomePayload>((r) => { priya.once('welcome', r); priya.emit('join', { name: 'Priya', avatarId: 'owl' }); });
    priya.disconnect(); // her phone dies
    await new Promise((r) => setTimeout(r, 150));
    const spare = client();
    const back = await new Promise<WelcomePayload>((r, j) => {
      spare.once('welcome', r);
      spare.once('error', (e: ErrorPayload) => j(new Error(e.code)));
      setTimeout(() => j(new Error('no welcome')), 3000);
      spare.emit('join', { name: 'priya', avatarId: 'cat' });
    });
    expect(back.playerId).toBe(first.playerId);
    expect(back.token).not.toBe(first.token); // the seat's login moved to the borrowed phone
    const me = back.room.players.find((p) => p.id === back.playerId);
    expect(me?.connected).toBe(true);
  });
});
