// Motion capture: one unfrozen round of a game with the TV recorded (Playwright recordVideo), plus
// timestamped stills around every transition and the last 5 seconds of the first timer.
// Usage: tsx packages/e2e/src/design/capture-video.ts --out reports/design/<stamp> [--game lightning-round]
import { existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, passAudioGate, settle } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42071' },
    game: { type: 'string', default: 'lightning-round' },
  },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const GAME = values.game ?? 'lightning-round';
const PORT = Number(values.port);

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const videoDir = join(OUT, GAME, 'video');
  mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch();
  try {
    await api.reset();
    const tvContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: videoDir, size: { width: 1920, height: 1080 } },
    });
    const tv = await tvContext.newPage();
    await tv.goto(`${server.url}/tv`);
    await passAudioGate(tv);
    const vip = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(vip, api, { avatarIndex: 3 });
    const p2 = await openPhone(browser, server.url, 'pixel', 'Priya');
    await joinViaForm(p2, api, { avatarIndex: 6 });
    await api.bots(3, 'random');
    const frame = (phase: string, note?: string): Promise<string> =>
      shots.shot(
        tv,
        { group: GAME, phase: `motion-${phase}`, device: 'tv', role: 'stage', note },
        { settleMs: 0 },
      );

    // Shorten the answer phase so the video stays short (settings come from the manifest).
    await api.post('/api/dev/start', { gameId: GAME, seed: 7, settings: { answerSeconds: 12 } });
    await frame('t0-start', 'first frame after start');
    await settle(300);
    await frame('t0.3', 'enter animation mid-way');
    await settle(1500);
    await p2.page.getByLabel(/your answer/i).fill('Waffles');
    await p2.page.getByRole('button', { name: /^submit$/i }).click();
    await settle(300);
    await frame('t2-submitted', 'chip flips to ✓');
    // Wait for the last 5 seconds of the answer timer.
    const state = await api.state();
    const deadline = state.room?.game?.state.phase.deadline ?? Date.now();
    const untilLast5 = deadline - Date.now() - 5200;
    if (untilLast5 > 0) await settle(untilLast5);
    for (let s = 5; s >= 1; s -= 1) {
      await frame(`last-${s}s`, 'urgent timer');
      await settle(1000);
    }
    await settle(800);
    await frame('reveal-0', 'first reveal frame');
    await settle(700);
    await frame('reveal-0.7', 'second item in');
    await settle(1500);
    await frame('reveal-2.2', 'reveal complete');
    // Let the reveal timer expire, then results.
    for (let i = 0; i < 40; i += 1) {
      const s = await api.state();
      if (s.room?.status !== 'playing') break;
      await settle(500);
    }
    await frame('results-0', 'first results frame');
    await settle(700);
    await frame('results-0.7', 'hero settled');
    await tvContext.close();
    for (const f of readdirSync(videoDir)) {
      if (f.endsWith('.webm') && !f.startsWith('round')) {
        const target = join(videoDir, 'round.webm');
        if (!existsSync(target)) renameSync(join(videoDir, f), target);
      }
    }
    console.log(`video → ${videoDir}/round.webm, ${shots.shots.length} frames`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
