// Fixture capture: every `games/<id>/fixtures/<phase>.json` rendered through `/preview` on the TV
// and on a phone for the first three players of the fixture (different roles), optionally in every
// theme. Deterministic and fast — no bots, no clock.
// Usage: tsx packages/e2e/src/design/capture-preview.ts --out reports/design/<stamp> [--games wisecrack,lightning-round] [--themes night,daylight,...] [--phones iphone,iphone-se]
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { DeviceId } from './devices';
import { REPO_ROOT, startServer } from './server';
import { openContext } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42071' },
    games: { type: 'string' },
    themes: { type: 'string', default: 'night' },
    phones: { type: 'string', default: 'iphone,iphone-se' },
    players: { type: 'string', default: '3' },
  },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const THEMES = (values.themes ?? 'night').split(',');
const PHONES = (values.phones ?? 'iphone').split(',') as DeviceId[];
const PLAYERS = Number(values.players);

function gamesOnDisk(): string[] {
  return readdirSync(join(REPO_ROOT, 'games'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && d.name !== 'node_modules')
    .map((d) => d.name);
}

function fixturesOf(game: string): string[] {
  return readdirSync(join(REPO_ROOT, 'games', game, 'fixtures'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

async function main(): Promise<void> {
  const games = values.games ? values.games.split(',') : gamesOnDisk();
  const server = await startServer(PORT);
  const shots = new Shooter(OUT);
  const browser = await chromium.launch();
  try {
    const tvContext = await openContext(browser, 'tv');
    const tv = await tvContext.newPage();
    const phonePages = new Map<DeviceId, Awaited<ReturnType<typeof tvContext.newPage>>>();
    for (const device of PHONES)
      phonePages.set(device, await (await openContext(browser, device)).newPage());
    for (const game of games) {
      for (const fixture of fixturesOf(game)) {
        const info = (await (
          await fetch(`${server.url}/api/dev/preview/${game}/${fixture}?view=controller`)
        ).json()) as { playerIds?: string[] };
        const playerIds = (info.playerIds ?? []).slice(0, PLAYERS);
        for (const theme of THEMES) {
          const suffix = theme === 'night' ? '' : `-${theme}`;
          await tv.goto(`${server.url}/preview/${game}/${fixture}?view=tv&theme=${theme}`);
          await tv.waitForSelector('[data-surface="tv"]');
          // The TV stage settles longer than a phone: a result lands in beats (Blanks names the
          // winner at 1.2 s) and a staggered grid is still arriving at 350 ms (review-loop #117).
          await shots.shot(
            tv,
            { group: game, phase: `${fixture}${suffix}`, device: 'tv', role: 'stage' },
            { settleMs: 1500 },
          );
          for (const [device, page] of phonePages) {
            for (const [i, playerId] of playerIds.entries()) {
              await page.goto(
                `${server.url}/preview/${game}/${fixture}?view=controller&player=${playerId}&theme=${theme}`,
              );
              await page.waitForSelector('[data-surface="controller"]');
              await shots.shot(page, {
                group: game,
                phase: `${fixture}${suffix}`,
                device,
                role: `p${i + 1}-${playerId}`,
              });
            }
          }
        }
      }
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
