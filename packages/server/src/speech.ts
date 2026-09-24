// READER-VOICES (ADR-045): the host's spoken reader. A game lists the readings its state wants
// (`speech(state)`); this makes each key once — Kokoro through a long-lived Python sidecar for the
// four voices, Windows' own Zira through PowerShell for "original" — caches the WAV, serves it at
// /api/speech/<key>.wav and answers the room with a `speech` event carrying the length (or -1 when
// it could not be made: the game carries on without a voice). Local processes only (ADR-012).
// Off with PARTYBOX_SPEECH=off; the Kokoro python and model come from PARTYBOX_TTS_PYTHON /
// PARTYBOX_TTS_DIR, else Session B's install beside the repo (C:\dev\partybox-ideas\tools\tts).
import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import type { EngineDeps } from '@partybox/engine';
import type { SpeechRequest } from '@partybox/shared';
import type { Host } from './host';

/** Kokoro voice ids with the speed and accent the owner heard in the samples. */
const KOKORO: Readonly<Record<string, { voice: string; speed: number; lang: string }>> = {
  george: { voice: 'bm_george', speed: 0.92, lang: 'en-gb' },
  fable: { voice: 'bm_fable', speed: 1, lang: 'en-gb' },
  jessica: { voice: 'af_jessica', speed: 1.1, lang: 'en-us' },
  sky: { voice: 'af_sky', speed: 1.1, lang: 'en-us' },
};
const KEY = /^[a-z0-9]{6,40}$/;
const HERE = dirname(fileURLToPath(import.meta.url));
const SIDECAR = resolve(HERE, '..', 'speech', 'kokoro_sidecar.py');

function ttsDir(): string | null {
  const candidates = [
    process.env['PARTYBOX_TTS_DIR'],
    resolve(HERE, '..', '..', '..', 'tools', 'tts'),
    'C:/dev/partybox-ideas/tools/tts',
  ];
  return candidates.find((d) => d && existsSync(join(d, 'kokoro-v1.0.onnx'))) ?? null;
}

function pythonIn(dir: string): string | null {
  const own = process.env['PARTYBOX_TTS_PYTHON'];
  if (own && existsSync(own)) return own;
  for (const p of [join(dir, 'venv', 'Scripts', 'python.exe'), join(dir, 'venv', 'bin', 'python')])
    if (existsSync(p)) return p;
  return null;
}

/** A WAV's length from its header (the data chunk over the byte rate). */
export function wavMs(file: string): number {
  const b = readFileSync(file);
  const byteRate = b.readUInt32LE(28);
  let at = 12;
  while (at + 8 <= b.length) {
    const id = b.toString('ascii', at, at + 4);
    const size = b.readUInt32LE(at + 4);
    if (id === 'data') return Math.round((Math.min(size, b.length - at - 8) / byteRate) * 1000);
    at += 8 + size;
  }
  return 0;
}

const xml = (t: string): string =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface SpeechService {
  /** Makes `req` once; `done` hears its length in ms, or -1. */
  want(req: SpeechRequest, done: (ms: number) => void): void;
  /** The cached file for a key, or null. */
  file(key: string): string | null;
  close(): void;
}

export function createSpeechService(cacheDir = join(tmpdir(), 'partybox-speech')): SpeechService {
  mkdirSync(cacheDir, { recursive: true });
  const waiting = new Map<string, ((ms: number) => void)[]>();
  const known = new Map<string, number>();
  let sidecar: ChildProcessWithoutNullStreams | null = null;
  let sidecarDead = false;
  let buffer = '';
  const out = (key: string): string => join(cacheDir, `${key}.wav`);

  const finish = (key: string, ms: number): void => {
    if (ms >= 0) known.set(key, ms);
    const listeners = waiting.get(key) ?? [];
    waiting.delete(key);
    for (const l of listeners) l(ms);
  };

  const startSidecar = (): ChildProcessWithoutNullStreams | null => {
    if (sidecar || sidecarDead) return sidecar;
    const dir = ttsDir();
    const python = dir ? pythonIn(dir) : null;
    if (!dir || !python) {
      sidecarDead = true;
      return null;
    }
    const child = spawn(python, [SIDECAR, dir], {
      windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      buffer += chunk;
      let nl = buffer.indexOf('\n');
      while (nl !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        nl = buffer.indexOf('\n');
        try {
          const msg = JSON.parse(line) as { id?: string; ms?: number; error?: string };
          if (msg.id) finish(msg.id, typeof msg.ms === 'number' ? msg.ms : -1);
        } catch {
          /* not a protocol line */
        }
      }
    });
    child.stderr.on('data', () => undefined);
    child.on('exit', () => {
      sidecar = null;
      sidecarDead = true;
      for (const key of [...waiting.keys()]) finish(key, -1);
    });
    sidecar = child;
    return child;
  };

  const zira = (req: SpeechRequest): void => {
    if (process.platform !== 'win32') return finish(req.key, -1);
    const text = req.parts.map((p) => ('ipa' in p ? (p.text ?? '') : p.text)).join(' ');
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><prosody rate="+15%" pitch="+10%">${xml(text)}</prosody></speak>`;
    const script =
      "Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; try { $s.SelectVoice('Microsoft Zira Desktop') } catch {}; $s.SetOutputToWaveFile($env:PB_OUT); $s.SpeakSsml($env:PB_SSML); $s.Dispose()";
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      windowsHide: true,
      env: { ...process.env, PB_OUT: out(req.key), PB_SSML: ssml },
    });
    child.on('exit', (code) => {
      const file = out(req.key);
      finish(req.key, code === 0 && existsSync(file) ? wavMs(file) : -1);
    });
    child.on('error', () => finish(req.key, -1));
  };

  return {
    want(req, done) {
      if (!KEY.test(req.key)) return done(-1);
      const ms = known.get(req.key);
      if (ms !== undefined) return done(ms);
      const file = out(req.key);
      if (existsSync(file) && statSync(file).size > 44) {
        const len = wavMs(file);
        known.set(req.key, len);
        return done(len);
      }
      const listeners = waiting.get(req.key);
      if (listeners) {
        listeners.push(done);
        return;
      }
      waiting.set(req.key, [done]);
      if (req.voice === 'original') return zira(req);
      const voice = KOKORO[req.voice];
      const child = voice ? startSidecar() : null;
      if (!voice || !child) return finish(req.key, -1);
      child.stdin.write(
        `${JSON.stringify({ id: req.key, ...voice, parts: req.parts, out: file })}\n`,
      );
    },
    file(key) {
      if (!KEY.test(key)) return null;
      const file = out(key);
      return existsSync(file) ? file : null;
    },
    close() {
      sidecar?.kill();
    },
  };
}

/** Wires the service to the host (every state change: ask for what the game wants) and the route. */
export function attachSpeech(
  fastify: FastifyInstance,
  host: Host,
  deps: EngineDeps,
  service: SpeechService = createSpeechService(),
): () => void {
  if (process.env['PARTYBOX_SPEECH'] === 'off') return () => undefined;
  // In flight, or answered this recently: a room's request is made once and answered once. It is
  // forgotten a moment after the answer (the game has recorded it by then), so a later game in the
  // same room that needs the same reading asks again and gets it from the cache — remembering it
  // forever left that game waiting the full fallback for an answer that never came (game-pack
  // audit #19), and grew without bound.
  const asked = new Map<string, number>();
  const FORGET_MS = 5000;
  const unsubscribe = host.subscribe((room) => {
    const running = room.game;
    if (!running || room.status !== 'playing') return;
    const game = deps.games[running.gameId];
    if (!game?.speech) return;
    const now = Date.now();
    for (const req of game.speech(running.state)) {
      const tag = `${room.code}:${req.key}`;
      const at = asked.get(tag);
      if (at !== undefined && (at === Infinity || now - at < FORGET_MS)) continue;
      asked.set(tag, Infinity);
      // A cached reading answers at once — inside this listener's own dispatch: defer it.
      service.want(req, (ms) =>
        queueMicrotask(() => {
          host.dispatch(room.code, { type: 'speech', key: req.key, ms });
          asked.set(tag, Date.now());
          setTimeout(() => {
            if (asked.get(tag) !== Infinity) asked.delete(tag);
          }, FORGET_MS).unref?.();
        }),
      );
    }
  });
  fastify.get('/api/speech/:file', async (req, reply) => {
    const { file } = req.params as { file: string };
    const path = service.file(file.replace(/\.wav$/, ''));
    if (!path) return reply.code(404).send({ error: 'not found' });
    return reply
      .type('audio/wav')
      .header('cache-control', 'max-age=86400')
      .send(readFileSync(path));
  });
  return () => {
    unsubscribe();
    service.close();
  };
}
