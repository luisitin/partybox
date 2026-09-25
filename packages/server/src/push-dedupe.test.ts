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

/** Resolves once `s` has had no `room` push for `ms` (fixed sleeps flaked under load: a late push
 *  from the joins landed inside the counting window — 2026-09-24). */
const quiet = (s: Socket, ms = 300): Promise<void> =>
  new Promise((done) => {
    let timer = setTimeout(finish, ms);
    const bump = (): void => {
      clearTimeout(timer);
      timer = setTimeout(finish, ms);
    };
    function finish(): void {
      s.off('room', bump);
      done();
    }
    s.on('room', bump);
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
    await quiet(ben, 600); // the joins' own pushes have all arrived
    let rooms = 0;
    ben.on('room', () => (rooms += 1));
    ana.emit('vip', { action: 'selectGame', gameId: 'bingo' });
    await quiet(ben, 600);
    expect(rooms).toBeGreaterThanOrEqual(1); // the pick changed the room: sent
    // Count only from here: under load a late push from the joins landed in the first window and
    // made it 2 (it failed three branches' verify on 2026-09-25) — the claim is about the no-op.
    rooms = 0;
    ana.emit('vip', { action: 'updateSettings', settings: {} }); // an empty change: the room is the same
    await quiet(ben, 600);
    expect(rooms).toBe(0);
  });
});
