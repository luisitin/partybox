// The session recorder against a real host, a tiny game and a temp folder: a recorded game leaves
// session.json / state.json / recap.md with its files, an aborted one is marked so, and a room with
// recording off leaves nothing.
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { GameDefinition, GameStateBase } from '@partybox/shared';
import { seedRng, z } from '@partybox/shared';
import { createClock } from './clock';
import { createHost } from './host';
import type { Transport } from './host';
import { createRecorder } from './recorder';

interface S extends GameStateBase {
  hits: number;
}

/** play (5 s) → done; any input counts a hit; the recap counts them too. `end` is ignored (abort path). */
const tiny: GameDefinition<S, { hit: true }> = {
  manifest: {
    id: 'tiny',
    name: 'Tiny',
    tagline: 't',
    description: 'd',
    version: '1.0.0',
    minPlayers: 1,
    maxPlayers: 8,
    estimatedMinutes: 1,
    tags: [],
    settings: [],
    supportsBots: true,
  },
  phases: ['play', 'done'],
  inputSchema: z.object({ hit: z.literal(true) }),
  init: (ctx) => ({
    phase: { id: 'play', startedAt: ctx.now, deadline: ctx.now + 5000 },
    rng: seedRng(ctx.seed),
    players: Object.fromEntries(ctx.players.map((p) => [p.id, p])),
    hits: 0,
  }),
  reduce: (s, e) => {
    if (e.type === 'timer' || (e.type === 'vip' && e.action === 'skip'))
      return { ...s, phase: { id: 'done', startedAt: e.now, deadline: null } };
    if (e.type === 'input') return { ...s, hits: s.hits + 1 };
    return s;
  },
  tvView: (s) => ({
    gameId: 'tiny',
    phaseId: s.phase.id,
    deadline: null,
    paused: false,
    players: [],
  }),
  controllerView: (s, id) => ({
    gameId: 'tiny',
    phaseId: s.phase.id,
    deadline: null,
    paused: false,
    players: [],
    me: { id, role: 'player' },
  }),
  results: (s) =>
    s.phase.id === 'done'
      ? {
          scores: Object.fromEntries(Object.keys(s.players).map((id) => [id, s.hits])),
          ranking: Object.keys(s.players).map((id) => ({ playerId: id, score: s.hits, rank: 1 })),
          winnerIds: Object.keys(s.players),
          awards: [],
        }
      : null,
  bot: { sampleInput: () => ({ hit: true }) },
  recap: (s, ctx) => ({
    markdown: `# Tiny\n\nhits: ${s.hits}; phases seen: ${ctx.history.map((h) => h.phase).join(',')}\n`,
    files: [{ name: 'hits.txt', body: String(s.hits) }],
  }),
};

const quiet: Transport = {
  toPlayer: () => {},
  toTvs: () => {},
  toAll: () => {},
  disconnectPlayer: () => {},
};

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

function setup(): {
  dir: string;
  host: ReturnType<typeof createHost>;
  recorder: ReturnType<typeof createRecorder>;
  code: string;
  vip: string;
} {
  const dir = mkdtempSync(join(tmpdir(), 'pb-rec-'));
  dirs.push(dir);
  const clock = createClock();
  clock.freeze(1_700_000_000_000);
  const host = createHost({ deps: { games: { tiny } }, clock, transport: quiet, log: () => {} });
  const recorder = createRecorder({ host, deps: { games: { tiny } }, dir, log: () => {} });
  const code = host.house().code;
  const { playerId, token } = host.mintPlayer();
  host.dispatch(code, { type: 'join', playerId, token, name: 'Sam', avatarId: 'fox' });
  return { dir, host, recorder, code, vip: playerId };
}

function sessionDirs(dir: string): string[] {
  const game = join(dir, 'tiny');
  try {
    return readdirSync(game).map((d) => join(game, d));
  } catch {
    return [];
  }
}

describe('recorder', () => {
  it('writes session, state and the recap with its files for a finished game', async () => {
    const { dir, host, recorder, code, vip } = setup();
    host.dispatch(code, {
      type: 'vip',
      playerId: vip,
      action: { action: 'selectGame', gameId: 'tiny' },
    });
    host.dispatch(code, { type: 'vip', playerId: vip, action: { action: 'start' }, seed: 1 });
    host.dispatch(code, { type: 'input', playerId: vip, input: { hit: true } });
    host.dispatch(code, { type: 'input', playerId: vip, input: { hit: true } });
    host.dispatch(code, { type: 'vip', playerId: vip, action: { action: 'skip' } });
    await recorder.flush();
    const [session] = sessionDirs(dir);
    expect(session).toBeDefined();
    expect(session).toMatch(new RegExp(`\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}-\\d{2}-${code}$`));
    const files = readdirSync(session as string).sort();
    expect(files).toEqual(['hits.txt', 'recap.md', 'session.json', 'state.json']);
    const meta = JSON.parse(readFileSync(join(session as string, 'session.json'), 'utf8'));
    expect(meta.game).toBe('tiny');
    expect(meta.outcome).toBe('finished');
    expect(meta.players).toEqual([{ id: vip, name: 'Sam', avatar: 'fox', bot: false }]);
    // The closing phase lands in the same dispatch as the results, so the timeline ends on `play`.
    expect(meta.timeline.map((t: { phase: string }) => t.phase)).toEqual(['play']);
    expect(meta.results.ranking).toEqual([{ rank: 1, name: 'Sam', score: 2 }]);
    expect(JSON.parse(readFileSync(join(session as string, 'state.json'), 'utf8')).hits).toBe(2);
    expect(readFileSync(join(session as string, 'recap.md'), 'utf8')).toContain('hits: 2');
    expect(readFileSync(join(session as string, 'hits.txt'), 'utf8')).toBe('2');
    expect(recorder.open()).toBe(0);
  });

  it('marks a game the VIP ended as aborted and still keeps the state', async () => {
    const { dir, host, recorder, code, vip } = setup();
    host.dispatch(code, {
      type: 'vip',
      playerId: vip,
      action: { action: 'selectGame', gameId: 'tiny' },
    });
    host.dispatch(code, { type: 'vip', playerId: vip, action: { action: 'start' }, seed: 1 });
    host.dispatch(code, { type: 'input', playerId: vip, input: { hit: true } });
    host.dispatch(code, { type: 'vip', playerId: vip, action: { action: 'end' } });
    await recorder.flush();
    const [session] = sessionDirs(dir);
    const meta = JSON.parse(readFileSync(join(session as string, 'session.json'), 'utf8'));
    expect(meta.outcome).toBe('aborted');
    expect(meta.results).toBeNull();
    expect(JSON.parse(readFileSync(join(session as string, 'state.json'), 'utf8')).hits).toBe(1);
  });

  it('writes nothing while recording is off, and records again once it is back on', async () => {
    const { dir, host, recorder, code, vip } = setup();
    host.dispatch(code, {
      type: 'vip',
      playerId: vip,
      action: { action: 'setRecording', on: false },
    });
    host.dispatch(code, {
      type: 'vip',
      playerId: vip,
      action: { action: 'selectGame', gameId: 'tiny' },
    });
    host.dispatch(code, { type: 'vip', playerId: vip, action: { action: 'start' }, seed: 1 });
    host.dispatch(code, { type: 'vip', playerId: vip, action: { action: 'skip' } });
    await recorder.flush();
    expect(sessionDirs(dir)).toEqual([]);
    host.dispatch(code, {
      type: 'vip',
      playerId: vip,
      action: { action: 'setRecording', on: true },
    });
    host.dispatch(code, { type: 'vip', playerId: vip, action: { action: 'playAgain' }, seed: 2 });
    host.dispatch(code, { type: 'vip', playerId: vip, action: { action: 'skip' } });
    await recorder.flush();
    expect(sessionDirs(dir)).toHaveLength(1);
  });
});
