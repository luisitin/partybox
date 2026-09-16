// The TV's Home button (TvFrame 🏠): mid-game, hover → armed ("Click again to go home") → the game
// ends and the SAME room is back in the lobby with everyone still in (ADR-031). From the lobby a
// second Home starts over with a fresh room code (dev-API reset).
// Usage: tsx packages/e2e/src/design/capture-home.ts --out reports/design/<stamp> [--game lightning-round]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
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

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser = await chromium.launch();
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const vip = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(vip, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    await api.clock(true);
    await api.start(GAME, 3);
    await settle(900);
    const before = (await api.state()).room?.code;
    const home = tv.getByRole('button', { name: /^home$/i });
    await home.hover();
    await shots.shot(tv, { group: 'home', phase: 'playing', device: 'tv', role: 'hover' });
    await home.click();
    await shots.shot(tv, { group: 'home', phase: 'armed', device: 'tv', role: 'stage' });
    await home.click();
    await settle(1200);
    const afterHome = (await api.state()).room;
    await shots.shot(tv, {
      group: 'home',
      phase: 'lobby-again',
      device: 'tv',
      role: 'stage',
      note: `room ${before} stays, status ${afterHome?.status}`,
    });
    await shots.shot(vip.page, {
      group: 'home',
      phase: 'lobby-again',
      device: 'iphone',
      role: 'kept',
    });
    if (!afterHome || afterHome.code !== before || afterHome.status !== 'lobby')
      throw new Error(
        `Home did not return the room to its lobby (${before} → ${afterHome?.code} ${afterHome?.status})`,
      );
    // From the lobby, Home starts over: a fresh room code.
    await home.click();
    await home.click();
    await settle(1200);
    const after = (await api.state()).room?.code;
    await shots.shot(tv, {
      group: 'home',
      phase: 'fresh-lobby',
      device: 'tv',
      role: 'stage',
      note: `room ${before} → ${after}`,
    });
    if (!after || after === before)
      throw new Error(`Home from the lobby did not mint a new room (${before} → ${after})`);
    console.log(`captured ${shots.shots.length} stills → ${OUT} (room ${before} → ${after})`);
    await vip.context.close();
    await tv.context().close();
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
