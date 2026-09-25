// ADR-047 end to end: a phone's "I can see the TV" rides on its join (or the host guesses from its
// address) and flips with a `presence` message; the room snapshot says who can't see the TV.
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
const client = (): Socket => {
  const s = connect(url, { transports: ['websocket'], forceNew: true });
  sockets.push(s);
  return s;
};

/** Joins and resolves with the welcome and a way to wait for the next snapshot that passes. */
async function join(name: string, extra: Record<string, unknown> = {}) {
  const socket = client();
  let last: RoomPush | null = null;
  const waiters: { test: (p: RoomPush) => boolean; done: (p: RoomPush) => void }[] = [];
  socket.on('room', (push: RoomPush) => {
    last = push;
    for (const w of [...waiters]) {
      if (!w.test(push)) continue;
      waiters.splice(waiters.indexOf(w), 1);
      w.done(push);
    }
  });
  const welcome = await new Promise<WelcomePayload>((resolve, reject) => {
    socket.once('welcome', resolve);
    socket.once('error', (e: ErrorPayload) => reject(new Error(e.code)));
    socket.emit('join', { name, avatarId: 'fox', ...extra });
  });
  const until = (test: (p: RoomPush) => boolean): Promise<RoomPush> =>
    last && test(last)
      ? Promise.resolve(last)
      : new Promise((done, fail) => {
          waiters.push({ test, done });
          setTimeout(() => fail(new Error('no such snapshot')), 3000);
        });
  return { socket, welcome, until };
}

const seeOf = (push: RoomPush, id: string) => push.room.players.find((p) => p.id === id)?.canSeeTv;

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

describe('ADR-047: presence over the socket', () => {
  it('a loopback phone that says nothing sees the TV; one that says so does not', async () => {
    const sam = await join('Sam');
    const maya = await join('Maya', { canSeeTv: false });
    const push = await sam.until((p) => p.room.players.length === 2);
    expect(seeOf(push, sam.welcome.playerId)).toBeUndefined();
    expect(seeOf(push, maya.welcome.playerId)).toBe(false);
  });

  it('a phone flips its toggle, and a bad payload is refused', async () => {
    const leo = await join('Leo');
    leo.socket.emit('presence', { canSeeTv: false });
    await leo.until((p) => seeOf(p, leo.welcome.playerId) === false);
    leo.socket.emit('presence', { canSeeTv: true });
    await leo.until((p) => seeOf(p, leo.welcome.playerId) === undefined);
    const refused = await new Promise<ErrorPayload>((resolve) => {
      leo.socket.once('error', resolve);
      leo.socket.emit('presence', { canSeeTv: 'maybe' });
    });
    expect(refused.code).toBe('invalid_payload');
  });
});
