// The timer on resume: the TV held 11 s through a pause, then read 18 for two frames
// before settling back on 11 — the seconds hook counted from a tick taken before the pause while
// the deadline had already moved by the pause's length. Polls the TV timer and Sam's phone bar
// every 25 ms through a pause/resume in a Lightning Round question and prints the largest reading.
// Usage: tsx packages/e2e/src/design/capture-resume-blip.ts [--port 42118]
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({ options: { port: { type: 'string', default: '42118' } } });

async function seconds(page: Page, selector: string): Promise<number | null> {
  const label = await page.locator(selector).first().getAttribute('aria-label');
  const m = /(\d+) seconds/.exec(label ?? '');
  return m ? Number(m[1]) : null;
}

let failed = 0;
function check(label: string, ok: boolean, detail: string): void {
  if (!ok) failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} — ${detail}`);
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
    await api.bots(4, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'lightning-round',
      seed: 5,
      settings: { questions: 3, answerSeconds: 30 },
    });
    await settle(600);
    await api.skip(); // intro → question
    await settle(3000);
    const TV = '[aria-label$="seconds left"], [aria-label="paused"]';
    const PHONE = '[role="timer"]';
    const heldTv = await seconds(tv, TV);
    const heldPhone = await seconds(sam.page, PHONE);
    await api.vip('pause');
    await settle(6000);
    check(
      'paused: the TV shows the pause glyph, no seconds',
      (await seconds(tv, TV)) === null,
      `label=${await tv.locator(TV).first().getAttribute('aria-label')}`,
    );
    const seen: { tv: number[]; phone: number[] } = { tv: [], phone: [] };
    void api.vip('resume');
    const until = Date.now() + 1500;
    while (Date.now() < until) {
      const [a, b] = await Promise.all([seconds(tv, TV), seconds(sam.page, PHONE)]);
      if (a !== null) seen.tv.push(a);
      if (b !== null) seen.phone.push(b);
      await settle(25);
    }
    const maxTv = Math.max(...seen.tv);
    const maxPhone = Math.max(...seen.phone);
    check(
      `TV resumes at the held ${heldTv} s — never a higher reading`,
      seen.tv.length > 0 && maxTv <= (heldTv ?? 0),
      `readings=${[...new Set(seen.tv)].join(',')}`,
    );
    check(
      `phone resumes at the held ${heldPhone} s — never a higher reading`,
      seen.phone.length > 0 && maxPhone <= (heldPhone ?? 0),
      `readings=${[...new Set(seen.phone)].join(',')}`,
    );
    console.log(failed ? `${failed} check(s) failed` : '3/3 checks passed');
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
