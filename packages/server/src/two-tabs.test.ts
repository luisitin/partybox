// I-755: two tabs, one login — the older tab is told why it lost the seat.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as connect } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { KickedPayload, WelcomePayload } from '@partybox/shared';
import { createApp } from './app';
import type { App } from './app';
import { createClock } from './clock';

let app: App;
let url: string;
const sockets: Socket[] = [];
const client = (): Socket => {
  const s = connect(url, { transports: ['websocket'], forceNew: true, reconnection: false });
  sockets.push(s);
  return s;
};

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

describe('I-755: another tab', () => {
  it('the tab that loses the seat is told another_tab', async () => {
    const tab1 = client();
    const first = await new Promise<WelcomePayload>((r) => {
      tab1.once('welcome', r);
      tab1.emit('join', { name: 'Priya', avatarId: 'owl' });
    });
    const kicked = new Promise<KickedPayload>((r) => tab1.once('kicked', r));
    const tab2 = client();
    tab2.emit('join', { name: 'Priya', avatarId: 'owl', token: first.token });
    expect((await kicked).reason).toBe('another_tab');
  });

  it('C: a login joining more than 3 times in 5 s is refused with another_tab', async () => {
    const tab1 = client();
    const first = await new Promise<WelcomePayload>((r) => {
      tab1.once('welcome', r);
      tab1.emit('join', { name: 'Omar', avatarId: 'owl' });
    });
    const answers: string[] = [];
    for (let i = 0; i < 4; i++) {
      const tab = client();
      answers.push(
        await new Promise<string>((r) => {
          tab.once('welcome', () => r('welcome'));
          tab.once('kicked', (k: KickedPayload) => r(`kicked:${k.reason}`));
          tab.emit('join', { name: 'Omar', avatarId: 'owl', token: first.token });
        }),
      );
    }
    expect(answers).toEqual(['welcome', 'welcome', 'welcome', 'kicked:another_tab']);
  });
});
