// Sync by the DOM, not the tape (loop 414): the TV and Sam's phone polled every 25 ms across three
// question → reveal cuts, printing the moment each surface's text shows the reveal. The recorded
// filmstrips put the phone three frames behind the TV; this says whether the product does — it
// does, by design: REVEAL_BEAT_MS (300 ms) holds the phone so it never leads the TV.
// Usage: tsx packages/e2e/src/design/capture-lightning-sync.ts [--port 42116]
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({ options: { port: { type: 'string', default: '42116' } } });

/** Polls until `needle` is in the page's text; returns the wall-clock moment it appeared. */
async function firstSeen(page: Page, needle: RegExp, timeoutMs: number): Promise<number | null> {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    const text = (await page.evaluate('document.body.innerText')) as string;
    if (needle.test(text)) return Date.now();
    await settle(25);
  }
  return null;
}

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
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
      gameId: 'lightning-round',
      seed: 4,
      settings: { questions: 5, answerSeconds: 30 },
    });
    await settle(600);
    await api.skip(); // intro → question 1
    const deltas: number[] = [];
    for (let q = 0; q < 3; q += 1) {
      await settle(1500);
      // Sam locks in so the phone has an outcome line to show at the reveal.
      for (let tries = 0; tries < 3; tries += 1) {
        await sam.page.locator('[role="radio"]:not([disabled])').first().dispatchEvent('click');
        await settle(500);
        if (((await sam.page.evaluate('document.body.innerText')) as string).includes('Locked in'))
          break;
      }
      await settle(300);
      const skipAt = Date.now();
      void api.skip(); // question → reveal, in real time
      const [tvAt, phoneAt] = await Promise.all([
        firstSeen(tv, /correct answer/, 4000),
        // A right pick says "Correct", a wrong one "Wrong · It was …".
        firstSeen(sam.page, /Correct|Wrong/, 4000),
      ]);
      const d = tvAt !== null && phoneAt !== null ? phoneAt - tvAt : Number.NaN;
      deltas.push(d);
      console.log(
        `question ${q + 1}: TV reveal +${(tvAt ?? 0) - skipAt} ms, phone +${(phoneAt ?? 0) - skipAt} ms → phone − TV = ${d} ms`,
      );
      await settle(600);
      await api.skip(); // reveal → next question
    }
    const worst = Math.max(...deltas.map((d) => Math.abs(d)));
    console.log(`worst |phone − TV| = ${worst} ms (one poll = 25 ms; a recorded frame = 100 ms)`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
