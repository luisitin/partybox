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
    /** Extra idle bots: a crowded roster (the TV's rows, the phones' chips) — loop 307. */
    bots: { type: 'string', default: '1' },
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
    // Priya's SE too (loop 306): the phone that is NOT claiming, on the same clock.
    const priya = await openPhoneRecorded(
      browser,
      server.url,
      'iphone-se',
      'Priya',
      join(OUT, 'video-priya'),
    );
    await joinViaForm(priya, api, { avatarIndex: 5 });
    await api.bots(Number(values.bots), 'idle');
    const marks: { name: string; at: number; before?: number; seconds?: number }[] = [];
    // 1. The intro, live: the deal, the demo, the 3 · 2 · 1, the first ball.
    marks.push({ name: '1-intro', at: Date.now(), before: 0, seconds: 7 });
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 9,
      settings: {
        rounds: 2,
        round1: 'line',
        round2: 'corners',
        cards: Number(values.cards),
        callSeconds: 60,
      },
    });
    await settle(7000);
    // 2. Three calls, 1.4 s apart.
    marks.push({ name: '2-calls', at: Date.now(), before: 0.1, seconds: 4.5 });
    for (let i = 0; i < 3; i += 1) {
      await api.skip();
      await settle(1400);
    }
    // 2b. Sam opens the card-style sheet: the room holds (a curtain on Priya, the TV's hold), then
    // closes it: the 3 · 2 · 1 on every screen and the next number (loop 319).
    marks.push({ name: '2b-hold', at: Date.now(), before: 0.1, seconds: 8 });
    await sam.page
      .getByRole('button', { name: /card style|style/i })
      .first()
      .click();
    await settle(2500);
    await sam.page.getByRole('button', { name: /^Close$/ }).click();
    await settle(5200);
    // 3. Sam's claim: dibs, the tap, the reveal to the verdict and its read.
    const me = (await api.playerId('Sam')) ?? '';
    const { line, card } = await skipToLine(api, me);
    // 3a. One to go (loop 420): the fourth daub leaves one square, which breathes (with the
    // hushed 'close') for a beat before the last daub.
    const [last, ...rest] = [...line].filter((i) => i !== 12).reverse();
    await daubLine(sam.page, rest.slice(0, -1), card);
    marks.push({ name: '3a-one-to-go', at: Date.now(), before: 0.1, seconds: 3.5 });
    await settle(300);
    await daubLine(sam.page, rest.slice(-1), card);
    await settle(2400);
    await daubLine(sam.page, [last as number], card);
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
    // 6. Between rounds (loop 305): a bingo, "next round" from the win screen, the board, then
    // round 2's intro — the second deal — on both screens.
    const again = await skipToLine(api, me, 1); // card 2: card 1 won the line and sits it out
    await daubLine(sam.page, again.line, again.card);
    await settle(400);
    await sam.page.getByRole('button', { name: /^bingo! card 2$/i }).click();
    await settle(400);
    await sam.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(9600);
    marks.push({ name: '6-next-round', at: Date.now(), before: 0.1, seconds: 12 });
    await sam.page.getByRole('button', { name: /next round/i }).click();
    // Round 2's card-pick step (loop 344): the auto-ready only covers the start, so the phones
    // pick here by hand 1.5 s after the second deal begins (loop 350).
    await settle(7500);
    await api.readyAll();
    await settle(4000);
    // 7. The end of the game: the VIP ends it → the results.
    marks.push({ name: '7-final', at: Date.now(), before: 0.1, seconds: 6 });
    await api.vip('end');
    await settle(5500);
    await cutStrips(priya, join(OUT, 'strips-priya'), marks);
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
