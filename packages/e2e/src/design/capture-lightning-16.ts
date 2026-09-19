// The Lightning Round question page at the game's cap: sixteen players put four chip rows above
// the stage and "0 / 16 locked in" went under the host bar at 1080p. Measures the count line
// against the host bar at 16 and at 6 players, and that the compact styles apply only at 16.
// Usage: tsx packages/e2e/src/design/capture-lightning-16.ts [--port 42124]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({ options: { port: { type: 'string', default: '42124' } } });
const OUT = join(REPO_ROOT, 'reports', 'design', 'lightning-16');
mkdirSync(OUT, { recursive: true });

let failed = 0;
let passed = 0;
function check(label: string, ok: boolean, detail: string): void {
  if (ok) passed += 1;
  else failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} — ${detail}`);
}

async function question(browser: Browser, url: string, api: DevApi, bots: number): Promise<Page> {
  await api.reset();
  const tv = await openTv(browser, url);
  await passAudioGate(tv);
  const sam = await openPhone(browser, url, 'iphone', 'Sam');
  await joinViaForm(sam, api, { avatarIndex: 1 });
  const priya = await openPhone(browser, url, 'pixel', 'Priya');
  await joinViaForm(priya, api, { avatarIndex: 4 });
  await api.bots(bots, 'idle');
  await api.post('/api/dev/start', {
    gameId: 'lightning-round',
    seed: 9,
    settings: { questions: 3 },
  });
  await settle(500);
  await api.skip(); // intro → question
  await settle(1200);
  return tv;
}

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    for (const players of [16, 6]) {
      const tv = await question(browser, server.url, api, players - 2);
      await tv.screenshot({ path: join(OUT, `${players}-question.png`) });
      const count = await tv
        .getByRole('status')
        .filter({ hasText: /locked in/ })
        .first()
        .boundingBox();
      const host = await tv
        .getByText(/^host$/i)
        .first()
        .boundingBox();
      const choice = await tv
        .locator('[aria-label="choices"] [role="listitem"]')
        .first()
        .boundingBox();
      const over = (await tv.evaluate(
        'document.documentElement.scrollHeight - document.documentElement.clientHeight',
      )) as number;
      check(
        `${players} players: "locked in" sits above the host bar`,
        count !== null && host !== null && count.y + count.height <= host.y - 8,
        `count bottom ${count ? (count.y + count.height).toFixed(0) : '?'}, host bar top ${host?.y.toFixed(0)}`,
      );
      check(`${players} players: nothing below the fold`, over <= 0, `overflow ${over}px`);
      const compact = choice !== null && choice.height < 110;
      check(
        `${players} players: the cards are ${players === 16 ? 'compact' : 'full size'}`,
        players === 16 ? compact : !compact,
        `first card ${choice?.height.toFixed(0)} px tall`,
      );
    }
    console.log(`${passed}/${passed + failed} checks passed → reports/design/lightning-16/`);
    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
