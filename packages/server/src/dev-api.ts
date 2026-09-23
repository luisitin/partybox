// Dev-only HTTP control API (docs/DEV_API.md). Every route checks `enabled` first and answers 403
// otherwise, so the routes can always be registered and toggled by a flag.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import type { EngineDeps } from '@partybox/engine';
import { nextWakeAt } from '@partybox/engine';
import { createRng, z } from '@partybox/shared';
import type { BotManager } from './bots';
import { BOT_STRATEGIES, vipPayloadSchema } from '@partybox/shared';
import type { Clock } from './clock';
import type { Host } from './host';
import type { Recorder } from './recorder';

export interface DevApiOptions {
  enabled: boolean;
  host: Host;
  bots: BotManager;
  clock: Clock;
  deps: EngineDeps;
  gamesDir: string;
  /** Dev resets close any session mid-write; dev starts record only when asked (ADR-035). */
  recorder?: Recorder | null;
}

const botsBody = z.object({
  count: z.number().int().min(1).max(16),
  strategy: z.enum(BOT_STRATEGIES).optional(),
  reactionMs: z.number().int().min(0).max(60_000).optional(),
});
const startBody = z.object({
  gameId: z.string(),
  settings: z.record(z.string(), z.union([z.number(), z.boolean(), z.string()])).optional(),
  seed: z.number().int().optional(),
  /** Tests and design captures should not pile up recaps: off unless the caller says so. */
  record: z.boolean().optional(),
});
const eventBody = z.object({ event: z.unknown() });
const loadStateBody = z.object({
  gameId: z.string(),
  state: z.unknown(),
  settings: z.record(z.string(), z.union([z.number(), z.boolean(), z.string()])).optional(),
});
const actBody = z.object({ playerId: z.string().optional(), seed: z.number().int().optional() });
// Any VIP action (the full protocol schema): the harness flips room switches too (S-004/S-005).
const vipBody = vipPayloadSchema;
const clockBody = z.object({ freeze: z.boolean(), now: z.number().optional() });
const disconnectBody = z.object({ playerId: z.string(), seconds: z.number().min(0).max(3600) });
const previewQuery = z.object({
  view: z.enum(['tv', 'controller']).default('tv'),
  player: z.string().optional(),
});
const SAFE_NAME = /^[a-z0-9-]+$/;

export function registerDevApi(app: FastifyInstance, options: DevApiOptions): void {
  const { host, bots, clock, deps } = options;
  const pending = new Map<string, NodeJS.Timeout>();

  app.addHook('onRequest', async (req, reply) => {
    if (req.url.startsWith('/api/dev/') && !options.enabled) {
      await reply.code(403).send({ error: 'dev api off (start with --dev or --dev-api)' });
      return;
    }
    // I-753 B: the developer API is for the host PC itself; the one route the TV's 🏠 needs
    // (start over) stays reachable, for a TV that is a separate device
    const loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip);
    if (req.url.startsWith('/api/dev/') && !loopback && !(req.method === 'POST' && req.url.startsWith('/api/dev/reset'))) {
      await reply.code(403).send({ error: 'host PC only' });
    }
  });

  const roomOf = (query: unknown): string => {
    const q = query as { room?: string };
    return q.room ?? host.house().code;
  };

  app.post('/api/dev/reset', async (req) => {
    for (const t of pending.values()) clearTimeout(t);
    pending.clear();
    bots.removeAll();
    clock.unfreeze();
    await options.recorder?.abortAll();
    host.reset();
    void req;
    return { ok: true, room: host.house().code };
  });

  app.post('/api/dev/bots', async (req, reply) => {
    const body = botsBody.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.message });
    const ids = bots.add(
      roomOf(req.query),
      body.data.count,
      body.data.strategy ?? 'random',
      body.data.reactionMs,
    );
    return { ok: true, playerIds: ids };
  });

  app.post('/api/dev/start', async (req, reply) => {
    const body = startBody.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.message });
    const code = roomOf(req.query);
    const room = host.get(code);
    if (!room) return reply.code(404).send({ error: 'room not found' });
    if (!deps.games[body.data.gameId]) return reply.code(404).send({ error: 'unknown game' });
    const vip = room.vipId ?? Object.keys(room.players)[0];
    if (!vip) return reply.code(409).send({ error: 'room has no players' });
    host.dispatch(code, {
      type: 'vip',
      playerId: vip,
      action: { action: 'selectGame', gameId: body.data.gameId },
    });
    if (body.data.settings)
      host.dispatch(code, {
        type: 'vip',
        playerId: vip,
        action: { action: 'updateSettings', settings: body.data.settings },
      });
    host.dispatch(code, {
      type: 'vip',
      playerId: vip,
      action: { action: 'setRecording', on: body.data.record ?? false },
    });
    const result = host.dispatch(code, {
      type: 'vip',
      playerId: vip,
      action: { action: 'start' },
      seed: body.data.seed,
    });
    const error = result?.effects.find((e) => e.type === 'error');
    if (error && error.type === 'error')
      return reply.code(409).send({ error: error.message, code: error.code });
    return { ok: true, status: host.get(code)?.status };
  });

  app.post('/api/dev/event', async (req, reply) => {
    const body = eventBody.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.message });
    const result = host.dispatch(roomOf(req.query), {
      type: 'dev:gameEvent',
      event: body.data.event,
    });
    return { ok: true, effects: result?.effects ?? [] };
  });

  // Any VIP game action as the room's VIP (the design harness pauses and resumes mid-phase).
  app.post('/api/dev/vip', async (req, reply) => {
    const body = vipBody.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.message });
    const code = roomOf(req.query);
    const room = host.get(code);
    const vip = room?.vipId ?? Object.keys(room?.players ?? {})[0];
    if (!room || !vip) return reply.code(409).send({ error: 'no players' });
    const result = host.dispatch(code, {
      type: 'vip',
      playerId: vip,
      action: body.data,
    });
    return { ok: true, effects: result?.effects ?? [] };
  });

  app.post('/api/dev/skip', async (req, reply) => {
    const code = roomOf(req.query);
    const room = host.get(code);
    const vip = room?.vipId ?? Object.keys(room?.players ?? {})[0];
    if (!room || !vip) return reply.code(409).send({ error: 'no players' });
    const result = host.dispatch(code, { type: 'vip', playerId: vip, action: { action: 'skip' } });
    return {
      ok: true,
      effects: result?.effects ?? [],
      status: host.get(code)?.status,
      phase: host.get(code)?.game?.state.phase.id ?? null,
    };
  });

  app.post('/api/dev/load-state', async (req, reply) => {
    const body = loadStateBody.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.message });
    const result = host.dispatch(roomOf(req.query), {
      type: 'dev:loadState',
      gameId: body.data.gameId,
      state: body.data.state,
      settings: body.data.settings,
    });
    return { ok: true, effects: result?.effects ?? [] };
  });

  app.get('/api/dev/state', async (req) => {
    const code = roomOf(req.query);
    const room = host.get(code);
    return {
      // I-753 A: never the players' login tokens (a token lets a phone take that player over)
      room: room
        ? {
            ...room,
            players: Object.fromEntries(
              Object.entries(room.players).map(([id, p]) => [id, { ...p, token: '' }]),
            ),
          }
        : null,
      nextWakeAt: room ? nextWakeAt(room) : null,
      clock: { now: clock.now(), frozen: clock.isFrozen() },
      bots: bots.ids(code),
      rooms: host.rooms().map((r) => r.code),
    };
  });

  app.post('/api/dev/clock', async (req, reply) => {
    const body = clockBody.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.message });
    if (body.data.freeze) clock.freeze(body.data.now);
    else clock.unfreeze();
    return { ok: true, now: clock.now(), frozen: clock.isFrozen() };
  });

  app.post('/api/dev/disconnect', async (req, reply) => {
    const body = disconnectBody.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: body.error.message });
    const code = roomOf(req.query);
    const player = host.get(code)?.players[body.data.playerId];
    if (!player) return reply.code(404).send({ error: 'player not found' });
    host.dispatch(code, { type: 'disconnect', playerId: player.id });
    const key = `${code}:${player.id}`;
    const existing = pending.get(key);
    if (existing) clearTimeout(existing);
    pending.set(
      key,
      setTimeout(() => {
        pending.delete(key);
        host.dispatch(code, {
          type: 'join',
          playerId: player.id,
          token: player.token,
          name: '',
          avatarId: '',
          existingToken: player.token,
        });
      }, body.data.seconds * 1000),
    );
    return { ok: true };
  });

  app.post('/api/dev/act', async (req, reply) => {
    const body = actBody.safeParse(req.body ?? {});
    if (!body.success) return reply.code(400).send({ error: body.error.message });
    const code = roomOf(req.query);
    const room = host.get(code);
    if (!room?.game || room.status !== 'playing')
      return { ok: true, acted: [], status: room?.status ?? null };
    const game = deps.games[room.game.gameId];
    if (!game) return reply.code(404).send({ error: 'unknown game' });
    const botIds = new Set(bots.ids(code));
    const targets = body.data.playerId
      ? [body.data.playerId]
      : Object.keys(room.game.state.players).filter((id) => !botIds.has(id));
    const acted: string[] = [];
    const rng = createRng(body.data.seed ?? room.game.state.rng.step + Date.now());
    for (const playerId of targets) {
      const current = host.get(code);
      if (!current?.game || current.status !== 'playing') break;
      const input = game.bot.sampleInput(current.game.state, playerId, rng);
      if (input === null) continue;
      host.dispatch(code, { type: 'input', playerId, input });
      acted.push(playerId);
      // A two-tap input (Bingo's BINGO!): the bot taps again straight away when it would repeat.
      const after = host.get(code);
      if (after?.game && after.status === 'playing') {
        const again = game.bot.sampleInput(after.game.state, playerId, rng);
        if (again !== null && JSON.stringify(again) === JSON.stringify(input))
          host.dispatch(code, { type: 'input', playerId, input: again });
      }
    }
    return {
      ok: true,
      acted,
      status: host.get(code)?.status,
      phase: host.get(code)?.game?.state.phase.id ?? null,
    };
  });

  app.get('/api/dev/preview/:gameId/:fixture', async (req, reply) => {
    const { gameId, fixture } = req.params as { gameId: string; fixture: string };
    const query = previewQuery.safeParse(req.query);
    if (!query.success) return reply.code(400).send({ error: query.error.message });
    const game = deps.games[gameId];
    if (!game || !SAFE_NAME.test(gameId) || !SAFE_NAME.test(fixture))
      return reply.code(404).send({ error: 'unknown game or fixture' });
    let state: { players: Record<string, unknown> };
    try {
      state = JSON.parse(
        await readFile(join(options.gamesDir, gameId, 'fixtures', `${fixture}.json`), 'utf8'),
      );
    } catch {
      return reply.code(404).send({ error: 'fixture not found' });
    }
    const playerId = query.data.player ?? Object.keys(state.players)[0] ?? 'spectator';
    const view =
      query.data.view === 'tv' ? game.tvView(state) : game.controllerView(state, playerId);
    // Fixture deadlines are historical timestamps; rebase so the timer shows the phase's full length.
    const phase = (state as { phase?: { startedAt?: number; deadline?: number | null } }).phase;
    const deadline =
      typeof phase?.deadline === 'number' && typeof phase.startedAt === 'number'
        ? clock.now() + Math.max(0, phase.deadline - phase.startedAt)
        : view.deadline;
    return {
      view: { ...view, deadline, vip: Object.keys(state.players)[0] ?? null },
      playerIds: Object.keys(state.players),
    };
  });
}
