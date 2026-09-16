// Fit check for the TV: the same lobby and playing phase at the viewports a real TV page meets
// (1080p, a PC at 150 % scaling = 1280×720, a 16:10 laptop, a 4K browser at 1× DPR). The stage
// must look identical at every size, only scaled (packages/client/src/tv/fit.ts).
// Usage: tsx packages/e2e/src/design/capture-fit.ts --out reports/design/<stamp> [--game lightning-round] (a game that welcomes bots)
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import type { DeviceId } from './devices';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: {
    game: { type: 'string', default: 'lightning-round' },
    out: { type: 'string' },
    port: { type: 'string', default: '42071' },
  },
});
const GAME = values.game as string;
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const SIZES: DeviceId[] = ['tv', 'pc720', 'laptop', 'tv4kcss'];

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser = await chromium.launch();
  try {
    await api.reset();
    // Bots cannot be VIP: one real phone starts the game, five bots fill the strip.
    const vip = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(vip, api, { avatarIndex: 1 });
    await api.bots(5, 'idle');
    const tvs = new Map<DeviceId, Page>();
    for (const size of SIZES) {
      const tv = await openTv(browser, server.url, size);
      await passAudioGate(tv);
      tvs.set(size, tv);
    }
    await settle(600);
    for (const [size, tv] of tvs)
      await shots.shot(tv, { group: 'fit', phase: 'lobby', device: size, role: 'stage' });
    await api.clock(true);
    await api.start(GAME, 3);
    await settle(900);
    const phase = (await api.state()).room?.game?.state.phase.id ?? 'playing';
    for (const [size, tv] of tvs)
      await shots.shot(tv, { group: 'fit', phase, device: size, role: 'stage' });
    for (const tv of tvs.values()) await tv.context().close();
    console.log(`captured ${shots.shots.length} stills → ${OUT}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
