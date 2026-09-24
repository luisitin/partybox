// attachSpeech asks for each reading once per room, and answers once — but forgets it a moment
// later, so a later game in the same room that needs the same reading asks again (game-pack audit
// #19: remembering it forever left that game waiting the full fallback, and grew without bound).
import Fastify from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EngineDeps } from '@partybox/engine';
import type { SpeechRequest } from '@partybox/shared';
import type { Host } from './host';
import { attachSpeech } from './speech';
import type { SpeechService } from './speech';

const REQ: SpeechRequest = { key: 'blabc123', voice: 'george', parts: [{ text: 'Hello.' }] };

function rig(): {
  push: () => void;
  events: unknown[];
  wants: number;
} {
  let listener: ((room: never) => void) | null = null;
  const events: unknown[] = [];
  const host = {
    subscribe: (l: (room: never) => void) => {
      listener = l;
      return () => undefined;
    },
    dispatch: (_code: string, event: unknown) => {
      events.push(event);
      return undefined;
    },
  } as unknown as Host;
  const deps = { games: { g: { speech: () => [REQ] } } } as unknown as EngineDeps;
  const r = { events, wants: 0, push: () => undefined as void };
  const service: SpeechService = {
    want: (_req, done) => {
      r.wants += 1;
      done(1200);
    },
    file: () => null,
    close: () => undefined,
  };
  attachSpeech(Fastify(), host, deps, service);
  const room = { code: 'ABCD', status: 'playing', game: { gameId: 'g', state: {} } };
  r.push = () => listener?.(room as never);
  return r;
}

describe('attachSpeech asks once, answers once, then forgets', () => {
  afterEach(() => vi.useRealTimers());

  it('does not ask twice while in flight or just answered', async () => {
    vi.useFakeTimers();
    const r = rig();
    r.push();
    r.push();
    await Promise.resolve();
    r.push();
    expect(r.wants).toBe(1);
    expect(r.events).toEqual([{ type: 'speech', key: REQ.key, ms: 1200 }]);
  });

  it('a later game in the same room gets the same reading again', async () => {
    vi.useFakeTimers();
    const r = rig();
    r.push();
    await Promise.resolve();
    vi.advanceTimersByTime(6000);
    r.push();
    await Promise.resolve();
    expect(r.wants).toBe(2);
    expect(r.events).toHaveLength(2);
  });
});
