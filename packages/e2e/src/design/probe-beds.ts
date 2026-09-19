// Why does a music bed cost the TV a 50 ms frame every third of a second (loop 404: 72 long
// frames with beds, 1 without, 3 with the pulse bed)? Records a Chrome performance trace of the TV
// for a few seconds of one bed phase and prints the long tasks with their attribution.
// Usage: tsx packages/e2e/src/design/probe-beds.ts [--game wisecrack] [--phase vote] [--seconds 8] [--port 42115]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { HOOKS } from './loop-tools';
import { DevApi, joinViaForm, openPhone, passAudioGate, settle } from './session';

const { values } = parseArgs({
  options: {
    game: { type: 'string', default: 'wisecrack' },
    phase: { type: 'string', default: 'vote' },
    seconds: { type: 'string', default: '8' },
    port: { type: 'string', default: '42115' },
  },
});
const GAME = values.game ?? 'wisecrack';
const PHASE = values.phase ?? 'vote';
const SECONDS = Number(values.seconds);

interface TraceEvent {
  name: string;
  ph: string;
  dur?: number;
  ts: number;
  args?: Record<string, unknown>;
}

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    await api.reset();
    // Same conditions as capture-loop: a recorded 1080p context, the frame hooks, a running clock.
    const tvContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      colorScheme: 'dark',
      recordVideo: {
        dir: join(REPO_ROOT, 'reports', 'design', 'probe-beds-video'),
        size: { width: 1920, height: 1080 },
      },
    });
    await tvContext.addInitScript(HOOKS);
    const tv = await tvContext.newPage();
    await tv.goto(`${server.url}/tv`);
    await tv.waitForSelector('[data-surface="tv"]');
    await passAudioGate(tv);
    const sam = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(sam, api, { avatarIndex: 3 });
    const priya = await openPhone(browser, server.url, 'pixel', 'Priya');
    await joinViaForm(priya, api, { avatarIndex: 6 });
    const kenji = await openPhone(browser, server.url, 'iphone-se', 'Kenji');
    await joinViaForm(kenji, api, { avatarIndex: 9 });
    await api.clock(true);
    await api.post('/api/dev/start', { gameId: GAME, seed: 3 });
    await settle(800);
    for (let i = 0; i < 12; i += 1) {
      const s = await api.state();
      if (s.room?.game?.state.phase.id === PHASE || s.room?.status !== 'playing') break;
      await api.post('/api/dev/act', {}).catch(() => undefined);
      await settle(300);
      const again = await api.state();
      if (again.room?.game?.state.phase.id === PHASE) break;
      await api.skip();
      await settle(400);
    }
    const phase = (await api.state()).room?.game?.state.phase.id;
    const bed = await tv.evaluate('window.__pbBeds?.current() ?? null');
    console.log(`phase=${phase} bed=${bed}`);
    await api.clock(false);
    await settle(1500);
    const longBefore = (await tv.evaluate('window.__pbLong.length')) as number;
    const out = join(REPO_ROOT, 'reports', 'design', 'probe-beds-trace.json');
    await browser.startTracing(tv, {
      path: out,
      categories: [
        'devtools.timeline',
        'disabled-by-default-devtools.timeline',
        'v8',
        'disabled-by-default-v8.gc',
        'blink.user_timing',
      ],
    });
    await settle(SECONDS * 1000);
    await browser.stopTracing();
    const longAfter = (await tv.evaluate('window.__pbLong.length')) as number;
    console.log(`rAF long frames in the window: ${longAfter - longBefore}`);
    const events = (JSON.parse(readFileSync(out, 'utf8')) as { traceEvents: TraceEvent[] })
      .traceEvents;
    const long = events
      .filter((e) => e.ph === 'X' && (e.dur ?? 0) >= 30_000)
      .sort((a, b) => a.ts - b.ts);
    console.log(`${long.length} events ≥ 30 ms in ${SECONDS} s:`);
    for (const e of long.slice(0, 40))
      console.log(
        `  ${((e.dur ?? 0) / 1000).toFixed(1)} ms ${e.name} ${JSON.stringify(e.args?.['data'] ?? e.args ?? {}).slice(0, 160)}`,
      );
    const gc = events.filter((e) => /GC|Garbage/i.test(e.name) && (e.dur ?? 0) > 1000);
    console.log(
      `GC events > 1 ms: ${gc.length}; total ${(gc.reduce((n, e) => n + (e.dur ?? 0), 0) / 1000).toFixed(0)} ms`,
    );
    const byName = new Map<string, { n: number; ms: number }>();
    for (const e of events.filter((x) => x.ph === 'X' && (x.dur ?? 0) >= 5000)) {
      const cur = byName.get(e.name) ?? { n: 0, ms: 0 };
      cur.n += 1;
      cur.ms += (e.dur ?? 0) / 1000;
      byName.set(e.name, cur);
    }
    console.log('events ≥ 5 ms by name:');
    for (const [name, v] of [...byName].sort((a, b) => b[1].ms - a[1].ms).slice(0, 12))
      console.log(`  ${name}: ${v.n} × ${(v.ms / v.n).toFixed(1)} ms`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
