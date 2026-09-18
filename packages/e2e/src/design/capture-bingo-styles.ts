// Bingo's phone styles and claim flow, live (owner picks, 2026-09-17): the style sheet and its
// preview bar, the hold curtain on the other phones and the TV while a menu is open, the 3 · 2 · 1,
// Grid with a BINGO! per card, the two-tap arm and the dibs queue, and a landscape phone on Strip
// versus the turn gate. Four cards each, a frozen clock, two real phones and two idle bots.
// Usage: tsx packages/e2e/src/design/capture-bingo-styles.ts --out reports/design/<stamp> [--port 42071]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import {
  DevApi,
  cutStrips,
  joinViaForm,
  openPhone,
  openTvRecorded,
  passAudioGate,
  settle,
} from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42071' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const G = 'bingo';

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser = await chromium.launch();
  try {
    await api.reset();
    const rec = await openTvRecorded(browser, server.url, join(OUT, 'video'));
    const tv = rec.page;
    const marks: { name: string; at: number; before?: number; seconds?: number }[] = [];
    await passAudioGate(tv);
    const vip = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(vip, api, { avatarIndex: 1 });
    const p2 = await openPhone(browser, server.url, 'iphone-se', 'Priya');
    await joinViaForm(p2, api, { avatarIndex: 5 });
    const p3 = await openPhone(browser, server.url, 'landscape', 'Leo');
    await joinViaForm(p3, api, { avatarIndex: 3 });
    await api.bots(1, 'idle');
    await api.post('/api/dev/start', {
      gameId: G,
      seed: 7,
      settings: { rounds: 1, round1: 'line', cards: 4, callSeconds: 6 },
    });
    await settle(600);
    // Intro: pick card 3 and swap it.
    await vip.page.getByRole('button', { name: /^Card 3$/ }).click();
    await settle(200);
    await shots.shot(vip.page, { group: G, phase: 'intro-pick', device: 'iphone', role: 'vip' });
    await vip.page.getByRole('button', { name: /^🎲 another/i }).click();
    await settle(300);
    await shots.shot(vip.page, { group: G, phase: 'intro-swapped', device: 'iphone', role: 'vip' });
    await api.skip(); // → play, call 1
    await api.skip();
    await api.skip();
    await settle(600);
    await shots.shot(vip.page, { group: G, phase: 'focus', device: 'iphone', role: 'vip' });
    await shots.shot(p3.page, { group: G, phase: 'focus-gate', device: 'landscape', role: 'p3' });
    // The style sheet: open (the room holds), preview Grid (the bar), confirm (3 · 2 · 1).
    marks.push({ name: 'tv-hold-curtain', at: Date.now(), before: 0.2, seconds: 2 });
    await vip.page
      .getByRole('button', { name: /card style|style/i })
      .first()
      .click();
    await settle(500);
    await shots.shot(vip.page, { group: G, phase: 'sheet', device: 'iphone', role: 'vip' });
    await shots.shot(p2.page, { group: G, phase: 'held', device: 'iphone-se', role: 'p2' });
    await shots.shot(tv, { group: G, phase: 'held', device: 'tv', role: 'stage' });
    await vip.page.getByRole('button', { name: /^Grid/ }).click();
    await settle(400);
    await shots.shot(vip.page, { group: G, phase: 'preview-grid', device: 'iphone', role: 'vip' });
    marks.push({ name: 'tv-resume-321', at: Date.now(), before: 0.2, seconds: 5 });
    await vip.page.getByRole('button', { name: /^Confirm$/ }).click();
    await settle(700);
    await shots.shot(tv, { group: G, phase: 'resume-3', device: 'tv', role: 'stage' });
    await shots.shot(p2.page, { group: G, phase: 'resume-3', device: 'iphone-se', role: 'p2' });
    await settle(3200);
    await shots.shot(vip.page, { group: G, phase: 'grid', device: 'iphone', role: 'vip' });
    await shots.shot(tv, { group: G, phase: 'resumed', device: 'tv', role: 'stage' });
    // Two taps: Sam arms card 2; Priya's tap queues behind; the TV says who is calling it.
    marks.push({ name: 'tv-armed', at: Date.now(), before: 0.2, seconds: 4.5 });
    await vip.page.getByRole('button', { name: /^BINGO! card 2$/i }).click();
    await settle(300);
    await p2.page.getByRole('button', { name: /^BINGO! card 1$/i }).click();
    await settle(300);
    await shots.shot(vip.page, { group: G, phase: 'armed', device: 'iphone', role: 'vip' });
    await shots.shot(p2.page, { group: G, phase: 'queued', device: 'iphone-se', role: 'p2' });
    await shots.shot(tv, { group: G, phase: 'armed', device: 'tv', role: 'stage' });
    await settle(3400); // Sam lets it lapse: Priya's window
    await shots.shot(p2.page, { group: G, phase: 'dibs-passed', device: 'iphone-se', role: 'p2' });
    await shots.shot(vip.page, { group: G, phase: 'dibs-passed', device: 'iphone', role: 'vip' });
    // Leo (landscape) picks Strip: no gate, four in a row.
    await p3.page
      .getByRole('button', { name: /card style|style/i })
      .first()
      .click();
    await settle(300);
    await p3.page.getByRole('button', { name: /^Strip/ }).click();
    await settle(300);
    await p3.page.getByRole('button', { name: /^Confirm$/ }).click();
    await settle(3600);
    await shots.shot(p3.page, { group: G, phase: 'strip', device: 'landscape', role: 'p3' });
    const video = await cutStrips(rec, join(OUT, 'strips'), marks);
    console.log(
      `captured ${shots.shots.length} stills → ${OUT}; strips from ${video ?? '(no video)'}`,
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
