// How `pnpm start` serves the built client (Part 00 §2.4, FOUNDATION-AUDIT #9), on a tiny fake
// dist: hashed chunks cached for good and sent precompressed, HTML always revalidated, audio kept
// a week but never immutable and never re-encoded.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { brotliCompressSync, brotliDecompressSync, gunzipSync, gzipSync } from 'node:zlib';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  CACHE_AUDIO,
  CACHE_HASHED,
  CACHE_HTML,
  cacheControlFor,
  registerStatic,
} from './static-cache';

const JS = `export const hello = ${JSON.stringify('partybox '.repeat(200))};\n`;
const HTML =
  '<!doctype html><title>PartyBox</title><script type="module" src="/assets/app-abc123.js"></script>';
const MP3 = Buffer.from([0xff, 0xfb, 0x90, 0x44, 0, 0, 0, 0]);
const BROWSER = {
  accept: 'text/html,application/xhtml+xml',
  'accept-encoding': 'gzip, deflate, br',
};

let dist: string;
let fastify: FastifyInstance;

beforeAll(async () => {
  dist = mkdtempSync(join(tmpdir(), 'partybox-static-'));
  mkdirSync(join(dist, 'assets'));
  mkdirSync(join(dist, 'sfx'));
  writeFileSync(join(dist, 'index.html'), HTML);
  writeFileSync(join(dist, 'robots.txt'), 'User-agent: *\n');
  writeFileSync(join(dist, 'assets', 'app-abc123.js'), JS);
  writeFileSync(join(dist, 'assets', 'app-abc123.js.br'), brotliCompressSync(JS));
  writeFileSync(join(dist, 'assets', 'app-abc123.js.gz'), gzipSync(JS));
  writeFileSync(join(dist, 'sfx', 'x.mp3'), MP3);
  fastify = Fastify({ logger: false });
  await registerStatic(fastify, dist);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
  rmSync(dist, { recursive: true, force: true });
});

describe('static cache headers', () => {
  it('a hashed asset is immutable and goes out brotli to a browser that takes it', async () => {
    const res = await fastify.inject({ url: '/assets/app-abc123.js', headers: BROWSER });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe(CACHE_HASHED);
    expect(res.headers['content-encoding']).toBe('br');
    expect(res.headers['content-type']).toMatch(/javascript/);
    expect(String(res.headers['vary'])).toMatch(/accept-encoding/i);
    expect(brotliDecompressSync(res.rawPayload).toString()).toBe(JS);
  });

  it('falls back to gzip, then to the plain file', async () => {
    const gz = await fastify.inject({
      url: '/assets/app-abc123.js',
      headers: { 'accept-encoding': 'gzip' },
    });
    expect(gz.headers['content-encoding']).toBe('gzip');
    expect(gunzipSync(gz.rawPayload).toString()).toBe(JS);
    const plain = await fastify.inject({ url: '/assets/app-abc123.js' });
    expect(plain.headers['content-encoding']).toBeUndefined();
    expect(plain.headers['cache-control']).toBe(CACHE_HASHED);
    expect(plain.body).toBe(JS);
  });

  it('the compressed siblings are not URLs of their own', async () => {
    const res = await fastify.inject({ url: '/assets/app-abc123.js.br' });
    expect(res.statusCode).toBe(404);
  });

  it('index.html and the SPA fallback are no-cache', async () => {
    for (const url of ['/', '/index.html', '/tv', '/preview/bingo/lobby']) {
      const res = await fastify.inject({ url, headers: BROWSER });
      expect(res.statusCode, url).toBe(200);
      expect(res.headers['cache-control'], url).toBe(CACHE_HTML);
      expect(res.headers['content-encoding'], url).toBeUndefined();
      expect(res.body, url).toBe(HTML);
    }
  });

  it('audio is kept a week, never immutable, never re-encoded', async () => {
    const res = await fastify.inject({ url: '/sfx/x.mp3', headers: BROWSER });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe(CACHE_AUDIO);
    expect(res.headers['cache-control']).not.toMatch(/immutable/);
    expect(res.headers['content-encoding']).toBeUndefined();
    expect(res.rawPayload.equals(MP3)).toBe(true);
  });

  it('anything else keeps the one-hour default', async () => {
    const res = await fastify.inject({ url: '/robots.txt', headers: BROWSER });
    expect(res.headers['cache-control']).toBe('public, max-age=3600');
  });

  it('an API miss is still a JSON 404, not the page', async () => {
    const res = await fastify.inject({ url: '/api/nope', headers: BROWSER });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'not found' });
  });

  it('classifies paths from either separator, siblings as their original', () => {
    expect(cacheControlFor('assets\\index-1.css.gz')).toBe(CACHE_HASHED);
    expect(cacheControlFor('music/lobby-time.mp3')).toBe(CACHE_AUDIO);
    expect(cacheControlFor('sfx/calls/fable/b12.wav')).toBe(CACHE_AUDIO);
    expect(cacheControlFor('index.html')).toBe(CACHE_HTML);
    expect(cacheControlFor('favicon.svg')).toBeNull();
  });
});
