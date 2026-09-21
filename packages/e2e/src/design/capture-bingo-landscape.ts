// A sideways phone in Safari: the tab bar takes ~60 px, so the viewport is 852 × 330 rather than
// 852 × 393. Side by side (2 cards) and Strip (4 cards) on that height, next to the full height,
// with the style preset in localStorage so the gate never shows.
// Usage: tsx packages/e2e/src/design/capture-bingo-landscape.ts --out <dir> [--port 42114]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import type { DeviceId } from './devices';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  joinViaForm,
  openContext,
  openTv,
  passAudioGate,
  phoneUrl,
  settle,
} from './session';
import type { Phone } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42114' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const G = 'bingo';

async function openStyled(
  browser: Browser,
  url: string,
  device: DeviceId,
  name: string,
  style: string,
): Promise<Phone> {
  const context = await openContext(browser, device);
  await context.addInitScript(
    (s: string) => localStorage.setItem('partybox:bingo-style', s),
    style,
  );
  const page = await context.newPage();
  await page.goto(await phoneUrl(url));
  await page.waitForSelector('[data-surface="controller"]');
  return { device, context, page, name, playerId: null };
}

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser = await chromium.launch();
  try {
    for (const [cards, style] of [
      [2, 'side'],
      [4, 'strip'],
    ] as const) {
      await api.reset();
      const tv = await openTv(browser, server.url);
      await passAudioGate(tv);
      const safari = await openStyled(browser, server.url, 'landscape-safari', 'Sam', style);
      await joinViaForm(safari, api, { avatarIndex: 1 });
      const full = await openStyled(browser, server.url, 'landscape', 'Leo', style);
      await joinViaForm(full, api, { avatarIndex: 3 });
      await api.bots(1, 'idle');
      await api.post('/api/dev/start', {
        gameId: G,
        seed: 3,
        settings: { rounds: 1, round1: 'line', cards, callSeconds: 60 },
      });
      await settle(500);
      await api.skip();
      await api.skip();
      await settle(800);
      await shots.shot(safari.page, {
        group: G,
        phase: style,
        device: 'landscape-safari',
        role: 'vip',
      });
      await shots.shot(full.page, { group: G, phase: style, device: 'landscape', role: 'leo' });
      await safari.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
      await settle(400);
      await shots.shot(safari.page, {
        group: G,
        phase: `${style}-armed`,
        device: 'landscape-safari',
        role: 'vip',
      });
      await tv.close();
      await safari.context.close();
      await full.context.close();
    }
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
