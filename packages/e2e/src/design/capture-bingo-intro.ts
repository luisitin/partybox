// The round intro on the TV at 10 fps (loop 243): the pattern demo lighting up cell by cell —
// for "any line" a row, a column, then a diagonal — over the 5 s intro of round 1, and the
// corners pattern of round 2 (via the fixture route, frozen clock, so both fit one run).
// With --live the clock runs: the countdown to the first ball, and the first call (loop 262).
// Usage: tsx packages/e2e/src/design/capture-bingo-intro.ts --out <dir> [--port 42140] [--live]
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
  openTvRecorded,
  passAudioGate,
  settle,
} from './session';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42140' },
    live: { type: 'boolean', default: false },
  },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    await api.reset();
    const rec = await openTvRecorded(browser, server.url, join(OUT, 'video'));
    await passAudioGate(rec.page);
    // --live records Sam's phone too: its count must land on the TV's beats (loop 263).
    const samRec = values.live
      ? await openPhoneRecorded(browser, server.url, 'iphone', 'Sam', join(OUT, 'video-phone'))
      : null;
    const sam = samRec ?? (await openPhone(browser, server.url, 'iphone', 'Sam'));
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    // --live: the clock runs, so the intro's last three seconds count down to the first ball
    // (loop 262) and the tape runs into the first call.
    if (!values.live) await api.clock(true);
    const marks = [{ name: 'intro-line', at: Date.now(), before: 0, seconds: values.live ? 7 : 5 }];
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 9,
      settings: { rounds: 2, round1: 'line', round2: 'corners', cards: 1, callSeconds: 60 },
    });
    if (values.live) {
      // "Deal me another" 1.8 s in (the deal has landed): the flip and its pluck (loop 268).
      await settle(1800);
      await sam.page.getByRole('button', { name: /deal me another/i }).click();
      await settle(5700);
    } else await settle(5200);
    if (!values.live) {
      await rec.page.goto(`${server.url}/preview/bingo/intro?view=tv&theme=night`);
      await rec.page.waitForSelector('[data-surface="tv"]');
      await settle(500);
    }
    if (samRec) await cutStrips(samRec, join(OUT, 'strips-phone'), marks);
    await cutStrips(rec, join(OUT, 'strips'), marks);
    console.log(`10 fps strips → ${join(OUT, 'strips')}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
