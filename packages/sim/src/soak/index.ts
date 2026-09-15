// `pnpm sim --soak --minutes 60` — the real server in-process (createApp on the stress port, dev
// API on, no client) playing bot games back to back with a TV socket and two phone sockets
// attached, sampling RSS / heap / event-loop lag / room snapshot size / game throughput every
// minute into a CSV. Any monotonic growth across the run is a finding.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import { io as connect } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { REPO_ROOT, jsonSize, loadAllGames } from '@partybox/game-sdk/testing';
// The server package has no public entry point (only main.ts); sim may import anything.
import { createApp } from '../../../server/src/app';
import type { App } from '../../../server/src/app';

export interface SoakOptions {
  port: number;
  minutes: number;
  bots?: number;
  outDir?: string;
  /** Called after every sample (progress line). */
  onSample?: (row: SoakRow) => void;
}

export interface SoakRow {
  minute: number;
  rssMb: number;
  heapMb: number;
  externalMb: number;
  lagP50Ms: number;
  lagP99Ms: number;
  lagMaxMs: number;
  snapshotBytes: number;
  games: number;
  gamesPerMin: number;
  sockets: number;
  errors: number;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export async function runSoak(
  options: SoakOptions,
): Promise<{ rows: SoakRow[]; csv: string; errors: string[] }> {
  const errors: string[] = [];
  const app: App = await createApp({
    port: options.port,
    host: '127.0.0.1',
    publicHost: '127.0.0.1',
    dev: false,
    devApi: true,
    quiet: true,
    serveClient: false,
  });
  // No registered game yet (registry empty)? Soak the template so the server layer still gets hit.
  if (Object.keys(app.deps.games).length === 0)
    for (const g of await loadAllGames())
      (app.deps.games as Record<string, (typeof g)['game']>)[g.game.manifest.id] = g.game;
  await app.listen();
  const url = `http://127.0.0.1:${app.port}`;
  const gameIds = Object.keys(app.deps.games);
  const bots = options.bots ?? 6;
  let games = 0;
  let lastGames = 0;
  const openSockets: Socket[] = [];

  const tv = connect(url, { transports: ['websocket'], forceNew: true });
  tv.on('connect', () => tv.emit('tv:join', {}));
  tv.on('error', (e: unknown) => errors.push(`tv error ${JSON.stringify(e)}`));
  openSockets.push(tv);

  // Two phones that join, play by echoing the bot's sample through the dev API, and rejoin.
  const phones: Socket[] = [];
  const phone = (name: string): Socket => {
    const s = connect(url, { transports: ['websocket'], forceNew: true });
    s.on('connect', () => s.emit('join', { name, avatarId: 'fox' }));
    s.on('view', (push: { view: { phaseId: string; me: { id: string; role: string } } }) => {
      if (push.view.me.role !== 'player') return;
      const room = app.host.house();
      const running = room.game;
      const game = running ? app.deps.games[running.gameId] : undefined;
      if (!running || !game) return;
      try {
        const input = game.bot.sampleInput(running.state, push.view.me.id, {
          float: () => 0.5,
          int: (a: number) => a,
          pick: <T>(items: readonly T[]) => items[0] as T,
          shuffle: <T>(items: readonly T[]) => [...items],
          chance: () => false,
          state: () => ({ seed: 0, step: 0 }),
        });
        if (input !== null) s.emit('input', { seq: games, input });
      } catch (err) {
        errors.push(`phone ${name} sample threw: ${String(err)}`);
      }
    });
    s.on('error', (e: { code: string }) => {
      if (!['not_playing', 'invalid_input', 'rate_limited'].includes(e.code))
        errors.push(`phone ${name} error ${JSON.stringify(e)}`);
    });
    openSockets.push(s);
    return s;
  };
  phones.push(phone('Phone A'), phone('Phone B'));

  // Keep games rolling: VIP skips the reveal, results → play again.
  const unsubscribe = app.host.subscribe((room) => {
    if (room.status === 'results') {
      games += 1;
      setTimeout(() => {
        const r = app.host.house();
        if (r.status === 'results' && r.vipId)
          app.host.dispatch(r.code, {
            type: 'vip',
            playerId: r.vipId,
            action: { action: 'playAgain' },
            seed: games,
          });
      }, 50);
    } else if (room.status === 'playing' && room.game && room.vipId) {
      const { phase } = room.game.state;
      if (phase.id === 'reveal' && !phase.paused)
        setTimeout(() => {
          const r = app.host.house();
          if (r.status === 'playing' && r.game?.state.phase.id === 'reveal' && r.vipId)
            app.host.dispatch(r.code, {
              type: 'vip',
              playerId: r.vipId,
              action: { action: 'skip' },
            });
        }, 100);
    }
  });

  const kickoff = async (): Promise<void> => {
    await fetch(`${url}/api/dev/reset`, { method: 'POST' });
    for (const p of phones) p.disconnect().connect();
    await sleep(500);
    await fetch(`${url}/api/dev/bots`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ count: bots, strategy: 'fast' }),
    });
    const res = await fetch(`${url}/api/dev/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gameId: gameIds[games % gameIds.length], seed: games }),
    });
    if (!res.ok) errors.push(`start failed: ${res.status} ${await res.text()}`);
  };

  const histogram = monitorEventLoopDelay({ resolution: 20 });
  histogram.enable();
  const rows: SoakRow[] = [];
  await kickoff();
  const started = Date.now();
  let lastStatus = '';
  let stuckSince = Date.now();
  for (let minute = 1; minute <= options.minutes; minute++) {
    const target = started + minute * 60_000;
    while (Date.now() < target) {
      await sleep(1000);
      const room = app.host.house();
      const status = `${room.status}:${room.game?.state.phase.id ?? ''}:${room.game?.state.phase.startedAt ?? ''}:${games}`;
      if (status !== lastStatus) {
        lastStatus = status;
        stuckSince = Date.now();
      } else if (Date.now() - stuckSince > 60_000) {
        errors.push(`no progress for 60 s at ${status}; restarting`);
        await kickoff();
        stuckSince = Date.now();
      }
    }
    const mem = process.memoryUsage();
    const row: SoakRow = {
      minute,
      rssMb: Math.round(mem.rss / 1048576),
      heapMb: Math.round(mem.heapUsed / 1048576),
      externalMb: Math.round(mem.external / 1048576),
      lagP50Ms: Math.round(histogram.percentile(50) / 1e6),
      lagP99Ms: Math.round(histogram.percentile(99) / 1e6),
      lagMaxMs: Math.round(histogram.max / 1e6),
      snapshotBytes: jsonSize(app.host.house()),
      games,
      gamesPerMin: games - lastGames,
      sockets:
        app.fastify.server.listenerCount('connection') >= 0
          ? openSockets.filter((s) => s.connected).length
          : 0,
      errors: errors.length,
    };
    lastGames = games;
    histogram.reset();
    rows.push(row);
    options.onSample?.(row);
  }
  unsubscribe();
  for (const s of openSockets) s.disconnect();
  await app.close();
  const header = Object.keys(rows[0] ?? { minute: 0 }).join(',');
  const csv = [header, ...rows.map((r) => Object.values(r).join(','))].join('\n');
  const dir = options.outDir ?? join(REPO_ROOT, 'reports', 'stress', 'metrics');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'soak.csv'), csv + '\n');
  if (errors.length > 0) writeFileSync(join(dir, 'soak-errors.txt'), errors.join('\n') + '\n');
  return { rows, csv, errors };
}
