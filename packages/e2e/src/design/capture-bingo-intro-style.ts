// The card-style sheet on the card-pick step (owner's play-test, 2026-09-19): Sam opens the 🃏
// sheet in the intro with two cards, taps Stack (applied at once, no hold on the room), the round
// starts with the sheet still open (it closes itself), and the first number is not held.
// Usage: tsx packages/e2e/src/design/capture-bingo-intro-style.ts --out <dir> [--port 42145]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42145' } },
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
    const sam = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 7,
      settings: { rounds: 1, round1: 'line', cards: 2, callSeconds: 8 },
      readyUp: false,
    });
    await settle(3500); // the deal
    await sam.page.screenshot({ path: join(OUT, 'intro-pill.png') });
    await sam.page
      .getByRole('button', { name: /card style|style/i })
      .first()
      .click();
    await settle(500);
    await sam.page.screenshot({ path: join(OUT, 'intro-sheet.png') });
    await tv.screenshot({ path: join(OUT, 'intro-tv-not-held.png') });
    await sam.page.getByRole('button', { name: /^Stack/ }).click();
    await settle(400);
    await sam.page.screenshot({ path: join(OUT, 'intro-sheet-stack.png') });
    // Leave the sheet open: the round starts (15 s cap) and the sheet must go with the intro.
    await settle(12500);
    await sam.page.screenshot({ path: join(OUT, 'play-after-intro.png') });
    await tv.screenshot({ path: join(OUT, 'play-tv.png') });
    const held = await sam.page.getByRole('dialog', { name: /card style/i }).count();
    const text = await tv.textContent('body');
    console.log(
      `sheet dialogs in play: ${held}; TV mentions paused: ${/paused|changing/i.test(text ?? '')}`,
    );
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
