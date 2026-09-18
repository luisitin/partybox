// A Bingo TV fixture in every theme (loop 253): the ball and the hall board wear their column's
// colour, and each theme must still read as itself. Stills only — the fixture is a frozen state.
// Usage: tsx packages/e2e/src/design/capture-bingo-themes.ts --out <dir> [--phase play] [--port 42161]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { openTv } from './session';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    phase: { type: 'string', default: 'play' },
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
    const tv = await openTv(browser, server.url);
    for (const theme of THEMES) {
      await tv.goto(`${server.url}/preview/bingo/${values.phase}?view=tv&theme=${theme}`);
      await tv.waitForSelector('[data-surface="tv"]');
      await tv.waitForTimeout(700); // the ball has landed, the cell has lit
      await tv.screenshot({ path: join(OUT, `${values.phase}-${theme}.png`) });
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
