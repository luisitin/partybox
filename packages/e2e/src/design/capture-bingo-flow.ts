// The whole round, TV and Sam's phone on one clock (loop 296 — the owner's rule: green mechanics
// are not a smooth game). Both surfaces are recorded from the start and cut at the SAME marks, so
// each window's two filmstrips line up frame for frame: the deal and the 3 · 2 · 1, three calls,
// the claim and its reveal to the verdict, "keep going" with its countdown and the repeated call.
// Look at the pairs for elements colliding, beats landing on different frames, stalls, doubles.
// Usage: tsx packages/e2e/src/design/capture-bingo-flow.ts --out <dir> [--port 42163] [--cards 2]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { daubLine, skipToLine } from './bingo-lines';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  cutStrips,
  joinViaForm,
  openPhoneRecorded,
  openTvRecorded,
  passAudioGate,
  settle,
} from './session';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42163' },
    cards: { type: 'string', default: '2' },
  },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    await api.reset();
    const rec = await openTvRecorded(browser, server.url, join(OUT, 'video-tv'));
    await passAudioGate(rec.page);
    const sam = await openPhoneRecorded(browser, server.url, 'iphone', 'Sam', join(OUT, 'video'));
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    const marks: { name: string; at: number; before?: number; seconds?: number }[] = [];
    // 1. The intro, live: the deal, the demo, the 3 · 2 · 1, the first ball.
    marks.push({ name: '1-intro', at: Date.now(), before: 0, seconds: 7 });
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 9,
      settings: { rounds: 1, round1: 'line', cards: Number(values.cards), callSeconds: 60 },
    });
    await settle(7000);
    // 2. Three calls, 1.4 s apart.
    marks.push({ name: '2-calls', at: Date.now(), before: 0.1, seconds: 4.5 });
    for (let i = 0; i < 3; i += 1) {
      await api.skip();
      await settle(1400);
    }
    // 3. Sam's claim: dibs, the tap, the reveal to the verdict and its read.
    const me = (await api.playerId('Sam')) ?? '';
    const { line, card } = await skipToLine(api, me);
    await daubLine(sam.page, line, card);
    await settle(600);
    marks.push({ name: '3-claim', at: Date.now(), before: 0.1, seconds: 10 });
    await sam.page.getByRole('button', { name: /^bingo! card 1$/i }).click();
    await settle(500);
    await sam.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(9600);
    // 4. "Keep going": the countdown on both screens, then the repeated call.
    marks.push({ name: '4-keep-going', at: Date.now(), before: 0.1, seconds: 6 });
    await sam.page.getByRole('button', { name: /keep going — same pattern/i }).click();
    await settle(5500);
    // 5. A wrong claim on card 2 (bare): the check's reveal, the verdict, the 3 · 2 · 1, the next
    // number — the way back on both screens.
    // (card 2 is already up: the phone brought it up when card 1 won).
    marks.push({ name: '5-wrong-claim', at: Date.now(), before: 0.1, seconds: 13 });
    await sam.page.getByRole('button', { name: /^bingo! card 2$/i }).click();
    await settle(400);
    await sam.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(12800);
    // 6. The end of the game: the VIP ends it → the drumroll (final, 4 s) → the results.
    marks.push({ name: '6-final', at: Date.now(), before: 0.1, seconds: 8 });
    await api.vip('end');
    await settle(7500);
    await cutStrips(sam, join(OUT, 'strips-phone'), marks);
    const video = await cutStrips(rec, join(OUT, 'strips-tv'), marks);
    console.log(`10 fps strips (tv + phone, same marks) from ${video ?? '(no video)'}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
