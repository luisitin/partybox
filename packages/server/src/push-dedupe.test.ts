// I-750 A: a push that changes nothing a phone shows is not sent to it again.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as connect } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { WelcomePayload } from '@partybox/shared';
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
const join = (s: Socket, name: string): Promise<WelcomePayload> =>
  new Promise((r) => {
    s.once('welcome', r);
    s.emit('join', { name, avatarId: 'fox' });
  });

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

describe('I-750 A: only what changed is sent', () => {
  it('a VIP action that changes nothing does not re-send the room', async () => {
    const ana = client();
    await join(ana, 'Ana');
    const ben = client();
    await join(ben, 'Ben');
    await new Promise((r) => setTimeout(r, 100));
    let rooms = 0;
    ben.on('room', () => (rooms += 1));
    ana.emit('vip', { action: 'selectGame', gameId: 'bingo' });
    await new Promise((r) => setTimeout(r, 150));
    expect(rooms).toBe(1); // the pick changed the room: sent once
    ana.emit('vip', { action: 'updateSettings', settings: {} }); // an empty change: the room is the same
    await new Promise((r) => setTimeout(r, 150));
    expect(rooms).toBe(1);
  });
});
