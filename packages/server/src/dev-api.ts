// Dev-only HTTP control API (docs/DEV_API.md). Every route checks `enabled` first and answers 403
// otherwise, so the routes can always be registered and toggled by a flag.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import type { EngineDeps } from '@partybox/engine';
import { nextWakeAt } from '@partybox/engine';
import { z } from '@partybox/shared';
import type { BotManager, BotStrategy } from './bots';
import { BOT_STRATEGIES } from './bots';
import type { Clock } from './clock';
import type { Host } from './host';

export interface DevApiOptions {
  enabled: boolean;
  host: Host;
  bots: BotManager;
  clock: Clock;
  deps: EngineDeps;
  gamesDir: string;
}

const botsBody = z.object({
  count: z.number().int().min(1).max(16),
  strategy: z.enum(BOT_STRATEGIES as [BotStrategy, ...BotStrategy[]]).optional(),
  reactionMs: z.number().int().min(0).max(60_000).optional(),
});
const startBody = z.object({
  gameId: z.string(),
  settings: z.record(z.string(), z.union([z.number(), z.boolean(), z.string()])).optional(),
  seed: z.number().int().optional(),
});
const eventBody = z.object({ event: z.unknown() });
const loadStateBody = z.object({
  gameId: z.string(),
  state: z.unknown(),
  settings: z.record(z.string(), z.union([z.number(), z.boolean(), z.string()])).optional(),
});
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
      room: room ?? null,
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
    return {
      view: { ...view, vip: Object.keys(state.players)[0] ?? null },
      playerIds: Object.keys(state.players),
    };
  });
}
