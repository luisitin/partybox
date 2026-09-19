// Builds the Fastify app + Socket.IO + host. `createApp` is used by main.ts and by the e2e/server
// tests (which pass port 0 and a frozen clock).
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import type { EngineDeps } from '@partybox/engine';
import { PARTYBOX_VERSION, gameManifestSchema } from '@partybox/shared';
import { gameSummaries } from '@partybox/engine';
import { createBotManager } from './bots';
import type { BotManager } from './bots';
import { createClock, createHost } from '@partybox/host';
import type { Clock, Host } from '@partybox/host';
import { registerDevApi } from './dev-api';
import { serverGames } from './games.generated';
import { detectLanIp } from './lan-ip';
import { qrSvg } from './qr';
import { createSocketLayer } from './sockets';

export const REPO_ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
export const CLIENT_DIR = join(REPO_ROOT, 'packages', 'client');
export const GAMES_DIR = join(REPO_ROOT, 'games');

export interface AppOptions {
  port: number;
  host?: string;
  /** Advertised host for phones (LAN IP by default). */
  publicHost?: string;
  dev: boolean;
  devApi: boolean;
  clock?: Clock;
  quiet?: boolean;
  /** false = API + sockets only (tests). */
  serveClient?: boolean;
}

export interface App {
  fastify: FastifyInstance;
  host: Host;
  bots: BotManager;
  clock: Clock;
  deps: EngineDeps;
  /** Resolved after listen(). */
  port: number;
  publicHost: string;
  urls(): { tv: string; join: string };
  listen(): Promise<void>;
  close(): Promise<void>;
}

/** Validates every registered manifest once at boot; a broken game must not start the server. */
export function loadGames(): EngineDeps {
  for (const [id, game] of Object.entries(serverGames)) {
    const parsed = gameManifestSchema.safeParse(game.manifest);
    if (!parsed.success)
      throw new Error(`games/${id}/manifest is invalid: ${parsed.error.message}`);
    if (parsed.data.id !== id) throw new Error(`games/${id}: manifest.id is "${parsed.data.id}"`);
  }
  return { games: serverGames };
}

export async function createApp(options: AppOptions): Promise<App> {
  const clock = options.clock ?? createClock();
  const deps = loadGames();
  const fastify = Fastify({ logger: false });
  // Tools often send `content-type: application/json` with no body (curl -X POST); treat as {}.
  fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    try {
      done(null, body === '' ? {} : JSON.parse(body as string));
    } catch (err) {
      done(err as Error, undefined);
    }
  });
  const startedAt = Date.now();
  const sockets = createSocketLayer(fastify.server);
  const host = createHost({
    deps,
    clock,
    transport: sockets.transport,
    log: options.quiet ? () => {} : undefined,
  });
  const bots = createBotManager(host, deps, clock);
  sockets.attach(host, deps);

  const app: App = {
    fastify,
    host,
    bots,
    clock,
    deps,
    port: options.port,
    publicHost: options.publicHost ?? process.env['PUBLIC_HOST'] ?? detectLanIp(),
    urls: () => ({
      tv: `http://${app.publicHost}:${app.port}/tv`,
      join: `http://${app.publicHost}:${app.port}/`,
    }),
    async listen() {
      await fastify.listen({ port: options.port, host: options.host ?? '0.0.0.0' });
      const address = fastify.server.address();
      if (address && typeof address === 'object') app.port = address.port;
    },
    async close() {
      bots.close();
      host.close();
      await sockets.io.close();
      await fastify.close();
    },
  };

  fastify.get('/healthz', async () => ({
    ok: true,
    version: PARTYBOX_VERSION,
    rooms: host.rooms().length,
    uptime: Math.round((Date.now() - startedAt) / 1000),
  }));

  fastify.get('/api/info', async () => {
    const { tv, join: joinUrl } = app.urls();
    return {
      version: PARTYBOX_VERSION,
      /** Boot time: a client that reconnects to a different value reloads (stale bundle guard). */
      startedAt,
      publicHost: app.publicHost,
      port: app.port,
      tvUrl: tv,
      joinUrl,
      qrSvg: await qrSvg(joinUrl),
      rooms: host
        .rooms()
        .map((r) => ({ code: r.code, locked: r.locked, players: Object.keys(r.players).length })),
      houseRoom: host.house().code,
      dev: options.dev,
    };
  });

  // Public: the registered games (what the lobby's picker shows), for tools and tests.
  fastify.get('/api/games', async () => gameSummaries(deps));

  registerDevApi(fastify, {
    enabled: options.dev || options.devApi,
    host,
    bots,
    clock,
    deps,
    gamesDir: GAMES_DIR,
  });

  if (options.serveClient === false) {
    // tests: no client
  } else if (options.dev) {
    await registerViteDev(fastify);
  } else {
    await registerStatic(fastify);
  }

  return app;
}

async function registerViteDev(fastify: FastifyInstance): Promise<void> {
  const [{ createServer: createViteServer }, middie] = await Promise.all([
    import('vite'),
    import('@fastify/middie'),
  ]);
  const vite = await createViteServer({
    configFile: join(CLIENT_DIR, 'vite.config.ts'),
    root: CLIENT_DIR,
    // HMR rides the same HTTP server (one port for phones); Socket.IO ignores non-matching upgrades.
    server: { middlewareMode: true, hmr: { server: fastify.server } },
    appType: 'spa',
  });
  await fastify.register(middie.default);
  fastify.use((req, res, next) => {
    const url = req.url ?? '/';
    // Fastify routes win for the API; everything else (SPA + assets + HMR) is Vite's.
    if (url.startsWith('/api/') || url === '/healthz' || url.startsWith('/socket.io/'))
      return next();
    vite.middlewares(req, res, next);
  });
  fastify.addHook('onClose', async () => {
    await vite.close();
  });
}

async function registerStatic(fastify: FastifyInstance): Promise<void> {
  const dist = join(CLIENT_DIR, 'dist');
  if (!existsSync(join(dist, 'index.html'))) {
    throw new Error(`No built client at ${dist}. Run "pnpm build" first (or use "pnpm dev").`);
  }
  const fastifyStatic = (await import('@fastify/static')).default;
  await fastify.register(fastifyStatic, {
    root: dist,
    wildcard: false,
    index: ['index.html'],
    cacheControl: true,
    maxAge: '1h',
    immutable: false,
  });
  // SPA fallback: any unknown GET that wants HTML gets index.html (routes are client-side).
  fastify.setNotFoundHandler(async (req, reply) => {
    if (
      req.method === 'GET' &&
      !req.url.startsWith('/api/') &&
      (req.headers.accept ?? '').includes('text/html')
    ) {
      return reply.sendFile('index.html');
    }
    return reply.code(404).send({ error: 'not found' });
  });
}
