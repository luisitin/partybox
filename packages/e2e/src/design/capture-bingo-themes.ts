// A Bingo TV fixture in every theme (loop 253): the ball and the hall board wear their column's
// colour, and each theme must still read as itself. Stills only — the fixture is a frozen state.
// With --view controller the phone is shot instead (--device iphone|se|ipad, --player p1).
// Usage: tsx packages/e2e/src/design/capture-bingo-themes.ts --out <dir> [--phase play] [--view tv] [--port 42161]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { openPhone, openTv } from './session';
import type { DeviceId } from './devices';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    phase: { type: 'string', default: 'play' },
    view: { type: 'string', default: 'tv' },
    device: { type: 'string', default: 'iphone' },
    player: { type: 'string', default: 'p1' },
    /** ms to wait before the shot: 700 for play; a claim needs ~2500 (announce, drop). */
    wait: { type: 'string', default: '700' },
    port: { type: 'string', default: '42161' },
  },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const THEMES = ['night', 'daylight', 'arcade', 'cabin', 'contrast'] as const;

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const browser = await chromium.launch();
  try {
    mkdirSync(OUT, { recursive: true });
    const phone = values.view === 'controller';
    const page = phone
      ? (await openPhone(browser, server.url, values.device as DeviceId, 'Preview')).page
      : await openTv(browser, server.url);
    const query = phone ? `view=controller&player=${values.player}` : 'view=tv';
    for (const theme of THEMES) {
      await page.goto(`${server.url}/preview/bingo/${values.phase}?${query}&theme=${theme}`);
      await page.waitForSelector(`[data-surface="${phone ? 'controller' : 'tv'}"]`);
      await page.waitForTimeout(Number(values.wait)); // the ball has landed, the card has dropped
      await page.screenshot({ path: join(OUT, `${values.phase}-${values.view}-${theme}.png`) });
    }
    console.log(`${THEMES.length} themes → ${OUT}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
