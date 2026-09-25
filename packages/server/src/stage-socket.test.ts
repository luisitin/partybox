// ADR-053 end to end: the VIP's Start opens the stage in the snapshot, each phone's `ready` lands
// in it, and the last one begins the count; ‹ Back closes it. (The count's end is the engine's
// tick, pinned in engine start-stage.test.ts.)
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

async function join(name: string) {
  const socket = connect(url, { transports: ['websocket'], forceNew: true });
  sockets.push(socket);
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
    socket.emit('join', { name, avatarId: 'fox' });
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

describe('ADR-053: the start stage over the socket', () => {
  it('Start opens it, READYs land, the last one begins the count; Back closes a new one', async () => {
    const sam = await join('Sam');
    const maya = await join('Maya');
    // Wisecrack takes 3: a bot makes the third (bots never hold the stage up)
    sam.socket.emit('bot', { action: 'add' });
    await sam.until((p) => p.room.players.length === 3);
    sam.socket.emit('vip', { action: 'selectGame', gameId: 'wisecrack' });
    sam.socket.emit('vip', { action: 'start' });
    const opened = await maya.until((p) => p.room.starting !== undefined);
    expect(opened.room.starting).toMatchObject({
      gameId: 'wisecrack',
      ready: [],
      countdownAt: null,
    });
    expect(opened.room.status).toBe('selecting');

    sam.socket.emit('ready', {});
    await maya.until((p) => p.room.starting?.ready.includes(sam.welcome.playerId) === true);
    maya.socket.emit('ready', {});
    const counting = await sam.until((p) => typeof p.room.starting?.countdownAt === 'number');
    expect(counting.room.starting?.ready).toEqual(
      expect.arrayContaining([sam.welcome.playerId, maya.welcome.playerId]),
    );

    // Wait (pause) stops the count; Back closes the stage
    sam.socket.emit('vip', { action: 'pause' });
    await maya.until((p) => p.room.starting?.held === true);
    sam.socket.emit('vip', { action: 'back' });
    const back = await maya.until((p) => p.room.starting === undefined);
    expect(back.room.status).toBe('selecting');
    expect(back.room.selectedGameId).toBe('wisecrack');
  });
});
