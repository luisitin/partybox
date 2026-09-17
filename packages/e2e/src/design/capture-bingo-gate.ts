// Bingo phone motion at 10 fps, part two: three daubs landing on the big card, then Strip picked
// on an upright phone → Confirm → the "turn your phone" gate (its little phone turning), then the
// phone rotated to landscape → the gate lifts and the Strip row appears.
// Usage: tsx packages/e2e/src/design/capture-bingo-gate.ts --out <dir> [--port 42099]
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
  options: { out: { type: 'string' }, port: { type: 'string', default: '42099' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const marks: { name: string; at: number; before?: number; seconds?: number }[] = [];
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
      settings: { rounds: 1, round1: 'line', cards: 4, callSeconds: 60 },
    });
    await settle(500);
    await api.skip();
    await settle(1500);
    // Three daubs on the big card, 400 ms apart: the cell's pop and the thumbnail's echo.
    marks.push({ name: 'daubs', at: Date.now(), before: 0.1, seconds: 2 });
    const cells = sam.page.getByRole('gridcell');
    await cells.nth(0).click();
    await settle(400);
    await cells.nth(6).click();
    await settle(400);
    await cells.nth(12).click();
    await settle(1200);
    // Strip on an upright phone → Confirm → the turn gate.
    await sam.page.getByRole('button', { name: /style/i }).first().click();
    await settle(800);
    await sam.page.getByRole('button', { name: /^Strip/ }).click();
    await settle(800);
    marks.push({ name: 'confirm-to-gate', at: Date.now(), before: 0.1, seconds: 5 });
    await sam.page.getByRole('button', { name: /^Confirm$/ }).click();
    await settle(5000);
    // Rotate: the gate lifts, the Strip row lays out.
    marks.push({ name: 'rotate-to-strip', at: Date.now(), before: 0.2, seconds: 2.5 });
    await sam.page.setViewportSize({ width: 852, height: 393 });
    await settle(2500);
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
