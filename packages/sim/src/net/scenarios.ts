// Socket + HTTP attack scenarios against a running server. Each returns a list of problems (empty =
// clean). Expectations come from docs/PROTOCOL.md: invalid payloads get an `error`, the server
// never crashes on client input, TVs are observers, non-VIPs cannot act, limits are enforced.
import { io as connect } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { ErrorPayload, WelcomePayload } from '@partybox/shared';

export interface NetContext {
  url: string;
  devApi: boolean;
  /** Opened sockets are tracked and closed after each scenario. */
  socket: () => Socket;
}

export type Scenario = (ctx: NetContext) => Promise<string[]>;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

function once<T>(socket: Socket, event: string, ms = 3000): Promise<T | undefined> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(undefined), ms);
    socket.once(event, (p: T) => {
      clearTimeout(t);
      resolve(p);
    });
  });
}

/** Waits for whichever comes first: welcome or error. */
async function join(
  socket: Socket,
  payload: unknown,
): Promise<{ welcome?: WelcomePayload; error?: ErrorPayload }> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve({}), 3000);
    const done = (r: { welcome?: WelcomePayload; error?: ErrorPayload }): void => {
      clearTimeout(t);
      socket.off('welcome', onW);
      socket.off('error', onE);
      resolve(r);
    };
    const onW = (w: WelcomePayload): void => done({ welcome: w });
    const onE = (e: ErrorPayload): void => done({ error: e });
    socket.on('welcome', onW);
    socket.on('error', onE);
    socket.emit('join', payload);
  });
}

async function connected(socket: Socket): Promise<boolean> {
  if (socket.connected) return true;
  await once(socket, 'connect', 3000);
  return socket.connected;
}

async function reset(ctx: NetContext): Promise<void> {
  if (ctx.devApi) await fetch(`${ctx.url}/api/dev/reset`, { method: 'POST' });
}

export const scenarios: Record<string, Scenario> = {
  async 'malformed payloads'(ctx) {
    await reset(ctx);
    const out: string[] = [];
    const s = ctx.socket();
    await connected(s);
    const junk: unknown[] = [
      null,
      undefined,
      0,
      '',
      'x',
      [],
      [1, 2],
      { a: 1 },
      { name: 1 },
      { name: 'x'.repeat(65), avatarId: 'fox' },
      JSON.parse('{"__proto__":{"polluted":true}}'),
    ];
    for (const j of junk) {
      const r = await join(s, j);
      if (r.welcome) out.push(`join accepted junk ${JSON.stringify(j)}`);
      if (!r.error) out.push(`join gave no error for ${JSON.stringify(j)}`);
    }
    for (const name of [
      'input',
      'vip',
      'leave',
      'tv:join',
      'nope',
      '__proto__',
      '',
      'message',
      'ack',
    ]) {
      for (const j of junk.slice(0, 6)) s.emit(name, j);
    }
    await sleep(300);
    if (!s.connected) out.push('socket dropped after junk events');
    if (({} as { polluted?: boolean }).polluted) out.push('prototype pollution via join payload');
    return out;
  },

  async 'oversized payload'(ctx) {
    await reset(ctx);
    const out: string[] = [];
    const s = ctx.socket();
    await connected(s);
    const w = await join(s, { name: 'Big', avatarId: 'fox' });
    if (!w.welcome) return ['could not join'];
    s.emit('input', { seq: 1, input: { type: 'answer', text: 'x'.repeat(20 * 1024) } });
    const e1 = await once<ErrorPayload>(s, 'error', 2000);
    if (!e1) out.push('20 KB input: no error (expected payload_too_large or not_playing)');
    s.emit('input', { seq: 2, input: 'x'.repeat(1024 * 1024) });
    await sleep(1500);
    // Socket.IO drops the connection for frames over maxHttpBufferSize; either outcome is fine
    // as long as the server survives (checked by the runner).
    return out;
  },

  async 'input flood 200/s'(ctx) {
    await reset(ctx);
    const out: string[] = [];
    const s = ctx.socket();
    await connected(s);
    if (!(await join(s, { name: 'Flood', avatarId: 'owl' })).welcome) return ['could not join'];
    let limited = 0;
    let acks = 0;
    s.on('error', (e: ErrorPayload) => {
      if (e.code === 'rate_limited') limited += 1;
    });
    s.on('ack', () => {
      acks += 1;
    });
    const started = Date.now();
    for (let i = 0; i < 1000; i++) {
      s.emit('input', { seq: i, input: { type: 'answer', text: 'go' } });
      if (i % 40 === 39) await sleep(200);
    }
    await sleep(1000);
    const seconds = (Date.now() - started) / 1000;
    if (limited === 0)
      out.push(`no rate_limited errors after 1000 inputs in ${seconds.toFixed(1)} s`);
    if (acks > 20 * seconds + 40)
      out.push(`${acks} acks in ${seconds.toFixed(1)} s exceeds 20/s + burst`);
    return out;
  },

  async '60 concurrent sockets'(ctx) {
    await reset(ctx);
    const out: string[] = [];
    const sockets = Array.from({ length: 60 }, () => ctx.socket());
    await Promise.all(sockets.map((s) => connected(s)));
    const results = await Promise.all(
      sockets.map((s, i) => join(s, { name: `P${i}`, avatarId: 'cat' })),
    );
    const welcomed = results.filter((r) => r.welcome).length;
    const full = results.filter((r) => r.error?.code === 'room_full').length;
    if (welcomed !== 16) out.push(`${welcomed} players welcomed (capacity 16)`);
    if (full !== 44) out.push(`${full} room_full errors, expected 44`);
    for (const s of sockets)
      for (let i = 0; i < 5; i++)
        s.emit('input', { seq: i, input: { type: 'answer', text: 'hi' } });
    await sleep(500);
    return out;
  },

  async 'connect/disconnect storm'(ctx) {
    await reset(ctx);
    const out: string[] = [];
    for (let i = 0; i < 150; i++) {
      const s = connect(ctx.url, {
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
      });
      if (i % 3 === 0) s.emit('join', { name: `S${i}`, avatarId: 'bee' });
      if (i % 2 === 0) s.disconnect();
      else setTimeout(() => s.disconnect(), 50);
    }
    await sleep(1500);
    const t = Date.now();
    const res = await fetch(`${ctx.url}/healthz`);
    if (!res.ok) out.push('healthz failed after storm');
    if (Date.now() - t > 500) out.push(`healthz took ${Date.now() - t} ms after storm`);
    return out;
  },

  async 'forged tokens and double identities'(ctx) {
    await reset(ctx);
    const out: string[] = [];
    const a = ctx.socket();
    await connected(a);
    const wa = await join(a, { name: 'Ana', avatarId: 'fox' });
    if (!wa.welcome) return ['could not join'];
    const forged = ctx.socket();
    await connected(forged);
    for (const token of ['x'.repeat(128), 'deadbeef', wa.welcome.token.slice(0, -1), '']) {
      const r = await join(forged, { name: 'Ana', avatarId: 'fox', token });
      if (r.welcome?.playerId === wa.welcome.playerId)
        out.push(`forged token ${token.slice(0, 8)}… resumed Ana`);
      if (r.welcome && r.welcome.playerId !== wa.welcome.playerId)
        out.push(`forged token joined as a NEW "Ana" (name_taken expected)`);
    }
    // Same token from a second device: the old socket must be replaced, not duplicated.
    const b = ctx.socket();
    await connected(b);
    const wb = await join(b, { name: 'Ana', avatarId: 'fox', token: wa.welcome.token });
    if (wb.welcome?.playerId !== wa.welcome.playerId) out.push('valid token did not resume');
    await sleep(300);
    if (a.connected) out.push('old socket still connected after its token was reused elsewhere');
    // Double join on one socket (F-003): the first identity must not become a ghost.
    const c = ctx.socket();
    await connected(c);
    const w1 = await join(c, { name: 'Cy', avatarId: 'owl' });
    const w2 = await join(c, { name: 'Dee', avatarId: 'owl' });
    if (w1.welcome && w2.welcome && w1.welcome.playerId !== w2.welcome.playerId) {
      c.disconnect();
      await sleep(400);
      const info = (await (await fetch(`${ctx.url}/api/dev/state`)).json()) as {
        room: { players: Record<string, { name: string; connected: boolean }> };
      };
      const ghost = Object.values(info.room.players).find((p) => p.name === 'Cy' && p.connected);
      if (ghost)
        out.push('F-003: first identity of a double-join socket stays connected forever (ghost)');
    }
    return out;
  },

  async 'locked room and TV observers'(ctx) {
    await reset(ctx);
    const out: string[] = [];
    const vip = ctx.socket();
    await connected(vip);
    const wv = await join(vip, { name: 'Vip', avatarId: 'fox' });
    if (!wv.welcome) return ['could not join'];
    vip.emit('vip', { action: 'lock' });
    await sleep(200);
    const late = ctx.socket();
    await connected(late);
    const r = await join(late, { name: 'Late', avatarId: 'owl' });
    if (r.error?.code !== 'room_locked')
      out.push(`join to a locked room gave ${r.error?.code ?? 'welcome'}`);
    vip.emit('vip', { action: 'unlock' });
    await sleep(200);
    const tv = ctx.socket();
    await connected(tv);
    tv.emit('tv:join', {});
    await sleep(200);
    tv.emit('input', { seq: 1, input: { type: 'answer', text: 'tv' } });
    const e = await once<ErrorPayload>(tv, 'error', 1500);
    if (!e) out.push('TV socket input produced no error');
    tv.emit('vip', { action: 'lock' });
    await sleep(200);
    const rt = await join(tv, { name: 'TvGuy', avatarId: 'owl' });
    if (rt.welcome)
      out.push('F-005: a TV socket can join as a player (PROTOCOL.md: TVs are observers)');
    // Non-VIP VIP actions.
    const peon = ctx.socket();
    await connected(peon);
    if (!(await join(peon, { name: 'Peon', avatarId: 'cat' })).welcome)
      out.push('peon could not join');
    peon.emit('vip', { action: 'kick', playerId: wv.welcome.playerId });
    const pe = await once<ErrorPayload>(peon, 'error', 1500);
    if (pe?.code !== 'not_vip') out.push(`non-VIP kick gave ${pe?.code ?? 'nothing'}`);
    await sleep(200);
    if (!vip.connected) out.push('VIP was kicked by a non-VIP');
    return out;
  },

  async 'http junk'(ctx) {
    const out: string[] = [];
    // -1 = the server closed the connection (fine for oversized bodies as long as it stays up).
    const post = async (path: string, body: string, type = 'application/json'): Promise<number> => {
      try {
        return (
          await fetch(`${ctx.url}${path}`, {
            method: 'POST',
            body,
            headers: { 'content-type': type },
          })
        ).status;
      } catch {
        return -1;
      }
    };
    for (const path of [
      '/api/dev/bots',
      '/api/dev/start',
      '/api/dev/event',
      '/api/dev/clock',
      '/api/dev/load-state',
    ]) {
      for (const body of [
        '{',
        'null',
        '[]',
        '"x"',
        '{"count":"x"}',
        'x'.repeat(2 * 1024 * 1024),
        '{"__proto__":{"polluted":1}}',
      ])
        if (ctx.devApi) {
          const status = await post(path, body);
          if (status >= 500) out.push(`${path} with ${body.slice(0, 12)}… → ${status}`);
          if (status === -1 && body.length < 1024)
            out.push(`${path} with ${body.slice(0, 12)}… closed the connection`);
        } else {
          const status = await post(path, body);
          if (status !== 403 && !(status === -1 && body.length >= 1024))
            out.push(`${path} answered ${status} with the dev API off (403 expected)`);
        }
    }
    for (const path of [
      '/api/dev/preview/..%2f..%2fpackage/json',
      '/api/dev/preview/template/..%2f..%2fmanifest',
      '/api/dev/preview/template/answer?view=nope',
      '/api/dev/state?room=%00',
    ]) {
      const res = await fetch(`${ctx.url}${path}`);
      if (res.status >= 500) out.push(`${path} → ${res.status}`);
      if (ctx.devApi && path.includes('..') && res.status === 200)
        out.push(`${path} → 200 (path traversal?)`);
    }
    const res = await fetch(`${ctx.url}/socket.io/?EIO=4&transport=polling&sid=nope`);
    if (res.status >= 500) out.push(`bogus sid → ${res.status}`);
    return out;
  },

  async 'raw websocket garbage'(ctx) {
    const out: string[] = [];
    const ws = new WebSocket(
      `${ctx.url.replace('http', 'ws')}/socket.io/?EIO=4&transport=websocket`,
    );
    await new Promise<void>((resolve) => {
      ws.onopen = () => resolve();
      ws.onerror = () => resolve();
      setTimeout(resolve, 2000);
    });
    if (ws.readyState === WebSocket.OPEN) {
      for (const frame of [
        'garbage',
        '42["join",',
        '42[1,2',
        '4',
        '0',
        '2',
        '42["join",{"name":"x","avatarId":"fox"}]',
        'x'.repeat(300_000),
        ' ',
      ]) {
        try {
          ws.send(frame);
        } catch {
          /* closed */
        }
      }
      await sleep(500);
      ws.close();
    } else out.push('raw websocket did not open');
    return out;
  },
};
