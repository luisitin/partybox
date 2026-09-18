// The daub at 10 fps (loop 238): Sam's iPhone recorded through three daubs 500 ms apart, then an
// un-daub, on the big Focus card — the stamp (drop, squash, ink spread) and the lift.
// Usage: tsx packages/e2e/src/design/capture-bingo-daub.ts --out <dir> [--port 42124]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  cutStrips,
  joinViaForm,
  openPhoneRecorded,
  openTv,
  passAudioGate,
  settle,
} from './session';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42124' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const sam = await openPhoneRecorded(browser, server.url, 'iphone', 'Sam', join(OUT, 'video'));
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 9,
      settings: { rounds: 1, round1: 'line', cards: 1, callSeconds: 60 },
    });
    await settle(500);
    await api.skip();
    await settle(1500);
    const cells = sam.page.getByRole('gridcell');
    const marks = [{ name: 'daubs', at: Date.now(), before: 0.1, seconds: 2.6 }];
    await cells.nth(0).click();
    await settle(500);
    await cells.nth(6).click();
    await settle(500);
    await cells.nth(18).click();
    await settle(700);
    await cells.nth(6).click(); // un-daub
    await settle(800);
    const video = await cutStrips(sam, join(OUT, 'strips'), marks);
    console.log(`10 fps strips from ${video ?? '(no video)'} → ${join(OUT, 'strips')}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
