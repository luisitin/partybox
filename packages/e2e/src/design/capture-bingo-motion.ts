// Bingo's phone motion at 10 fps (owner's rule, 2026-09-17: at least ten frames a second when a
// transition or animation is examined): Sam's iPhone is recorded through the style sheet opening,
// a Grid preview, Confirm and the 3 · 2 · 1, the armed BINGO! pulse, dibs passing to the next in
// line, and a wrong claim wiping the card. Frames land in <out>/strips/<window>/fNN.png.
// Usage: tsx packages/e2e/src/design/capture-bingo-motion.ts --out <dir> [--port 42095]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  cutStrips,
  joinViaForm,
  openPhone,
  openPhoneRecorded,
  openTv,
  passAudioGate,
  settle,
} from './session';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42095' } },
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
    const priya = await openPhone(browser, server.url, 'iphone-se', 'Priya');
    await joinViaForm(priya, api, { avatarIndex: 5 });
    await api.bots(1, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 7,
      settings: { rounds: 1, round1: 'line', cards: 4, callSeconds: 60 },
    });
    await settle(500);
    marks.push({ name: 'intro-to-play', at: Date.now(), before: 0.2, seconds: 2 });
    await api.skip(); // intro → play: the first call lands on the phone header
    await settle(2200);
    // The style sheet: open, preview Grid, confirm → 3 · 2 · 1 → play resumes.
    marks.push({ name: 'sheet-open', at: Date.now(), before: 0.1, seconds: 1.5 });
    await sam.page.getByRole('button', { name: /style/i }).first().click();
    await settle(1500);
    marks.push({ name: 'preview-grid', at: Date.now(), before: 0.1, seconds: 1.5 });
    await sam.page.getByRole('button', { name: /^Grid/ }).click();
    await settle(1500);
    marks.push({ name: 'confirm-countdown', at: Date.now(), before: 0.1, seconds: 4.5 });
    await sam.page.getByRole('button', { name: /^Confirm$/ }).click();
    await settle(4500);
    // Two taps: Sam arms card 1 (the pulse), Priya queues, Sam lets it lapse → dibs pass.
    marks.push({ name: 'arm-pulse', at: Date.now(), before: 0.1, seconds: 2 });
    await sam.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await settle(600);
    await priya.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await settle(1400);
    marks.push({ name: 'dibs-pass', at: Date.now(), before: 0.2, seconds: 2.5 });
    await settle(2500); // Sam's window lapses at ~3 s: Priya's phone takes over
    await settle(3500); // Priya's lapses too; the queue is empty again
    // A wrong claim from Sam on card 1: the phone during the check, then the wipe.
    marks.push({ name: 'claim-check-wipe', at: Date.now(), before: 0.2, seconds: 8 });
    await sam.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await sam.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(8000);
    await api.skip(); // check → play: the wiped card comes back
    await settle(1800);
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
