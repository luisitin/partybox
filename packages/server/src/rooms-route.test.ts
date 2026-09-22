// POST /api/rooms on the real server (ADR-043): codes, the room cap, and the per-address limit.
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
    devApi: false,
    clock: createClock(),
    quiet: true,
    serveClient: false,
    publicHost: '127.0.0.1',
    recordingsDir: null,
  });
  await app.listen();
  url = `http://127.0.0.1:${app.port}`;
});

afterAll(async () => {
  await app.close();
});

async function open(
  body: unknown,
  from: string,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const res = await fetch(`${url}/api/rooms`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': from },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

describe('POST /api/rooms', () => {
  it('opens a room with the code asked for, or a fresh one', async () => {
    const a = await open({ code: 'pqrs' }, '10.0.0.1');
    expect(a).toEqual({ status: 200, json: { code: 'PQRS', listed: true } });
    const b = await open({ listed: false }, '10.0.0.1');
    expect(b.status).toBe(200);
    expect(b.json.listed).toBe(false);
    expect(String(b.json.code)).toMatch(/^[A-Z]{4}$/);
  });

  it('refuses a taken or an invalid code without charging the address', async () => {
    // 10.0.0.1 has used 2 of its 3; mistakes must not use up the last one
    expect((await open({ code: 'PQRS' }, '10.0.0.1')).status).toBe(409);
    expect((await open({ code: 'DONE' }, '10.0.0.1')).status).toBe(400); // O is a look-alike
    expect((await open({ code: 'AB' }, '10.0.0.1')).status).toBe(400);
    expect((await open({}, '10.0.0.1')).status).toBe(200); // the third real one still goes
  });

  it('slows an address down after a burst of three, and only that address', async () => {
    const r = await open({}, '10.0.0.1');
    expect(r.status).toBe(429);
    expect(r.json.error).toBe('slow_down');
    expect((await open({}, '10.0.0.2')).status).toBe(200);
  });

  it('never keeps more than twelve rooms', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 20; i++) statuses.push((await open({}, `10.1.0.${i}`)).status);
    const info = (await (await fetch(`${url}/api/info`)).json()) as { rooms: unknown[] };
    expect(info.rooms.length).toBe(12);
    expect(statuses.filter((s) => s === 429).length).toBeGreaterThan(0);
  });
});
