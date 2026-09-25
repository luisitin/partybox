// /api/speech/<key>.wav and the service's key check (game-pack audit #18): `<gameId>-<hash>` keys of
// hyphenated game ids are made and served, anything path-like is refused, and a served WAV is
// cached for good (keys are content hashes).
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Fastify from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { EngineDeps } from '@partybox/engine';
import type { Host } from './host';
import { attachSpeech, createSpeechService } from './speech';
import type { SpeechService } from './speech';

const HYPHENATED = 'broken-pencil-0123456789abcdef';

/** A 24 kHz mono 16-bit WAV of `ms` of silence. */
function wav(ms: number): Buffer {
  const data = Buffer.alloc(48 * ms);
  const head = Buffer.alloc(44);
  head.write('RIFF', 0, 'ascii');
  head.writeUInt32LE(36 + data.length, 4);
  head.write('WAVEfmt ', 8, 'ascii');
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(24_000, 24);
  head.writeUInt32LE(48_000, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36, 'ascii');
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}

let dir = '';
let service: SpeechService;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'partybox-speech-test-'));
  service = createSpeechService(dir);
});
afterEach(() => {
  service.close();
  rmSync(dir, { recursive: true, force: true });
});

async function app(): Promise<ReturnType<typeof Fastify>> {
  const fastify = Fastify();
  const host = { subscribe: () => () => undefined } as unknown as Host;
  attachSpeech(fastify, host, { games: {} } as unknown as EngineDeps, service);
  await fastify.ready();
  return fastify;
}

describe('speech keys', () => {
  it('makes a hyphenated key: a cached reading answers with its length', async () => {
    writeFileSync(join(dir, `${HYPHENATED}.wav`), wav(1500));
    const ms = await new Promise<number>((done) =>
      service.want({ key: HYPHENATED, voice: 'george', parts: [{ text: 'Hi.' }] }, done),
    );
    expect(ms).toBe(1500);
  });

  it('refuses a key that could name a path, or is out of shape, without making anything', async () => {
    for (const key of ['../x', 'a/b', 'ABCDEF123', '-abcdef', 'abc', `a${'b'.repeat(64)}`]) {
      const ms = await new Promise<number>((done) =>
        service.want({ key, voice: 'george', parts: [{ text: 'Hi.' }] }, done),
      );
      expect(ms, key).toBe(-1);
      expect(service.file(key), key).toBeNull();
    }
  });
});

describe('GET /api/speech/<key>.wav', () => {
  it('serves a hyphenated key, immutable', async () => {
    writeFileSync(join(dir, `${HYPHENATED}.wav`), wav(200));
    const res = await (await app()).inject({ url: `/api/speech/${HYPHENATED}.wav` });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('audio/wav');
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(res.rawPayload.length).toBe(44 + 48 * 200);
  });

  it('still serves the old unhyphenated keys (Blanks)', async () => {
    writeFileSync(join(dir, 'bl1a2b3c4d5e6f.wav'), wav(10));
    const res = await (await app()).inject({ url: '/api/speech/bl1a2b3c4d5e6f.wav' });
    expect(res.statusCode).toBe(200);
  });

  it('refuses path traversal, slashes, uppercase and over-long keys', async () => {
    // Files that exist, so only the key check stands between them and the response.
    writeFileSync(join(dir, 'ABCDEF123.wav'), wav(10));
    const long = `a${'b'.repeat(64)}`;
    writeFileSync(join(dir, `${long}.wav`), wav(10));
    const fastify = await app();
    for (const url of [
      '/api/speech/..%2F..%2Fpackage.json',
      '/api/speech/..%2Fx.wav',
      '/api/speech/a%2Fb.wav',
      '/api/speech/..%5Cx.wav',
      '/api/speech/ABCDEF123.wav',
      `/api/speech/${long}.wav`,
      '/api/speech/missing-000000.wav',
    ]) {
      const res = await fastify.inject({ url });
      expect(res.statusCode, url).toBe(404);
      expect(res.headers['cache-control'], url).toBeUndefined();
    }
  });
});
