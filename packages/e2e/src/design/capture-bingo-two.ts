// Bingo with two cards, live: Stack (upright) and Side by side (sideways) picked from the sheet,
// the intro swap on the second card, a queued phone taking over dibs, and the three-card Grid's
// spare slot showing the call. Usage: tsx packages/e2e/src/design/capture-bingo-two.ts --out <dir> [--port]
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42077' } },
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
    // ── two cards: Stack upright, Side by side sideways ──
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const vip = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(vip, api, { avatarIndex: 1 });
    const side = await openPhone(browser, server.url, 'landscape', 'Leo');
    await joinViaForm(side, api, { avatarIndex: 3 });
    await api.bots(1, 'idle');
    await api.post('/api/dev/start', {
      gameId: G,
      seed: 3,
      settings: { rounds: 1, round1: 'line', cards: 2, callSeconds: 6 },
    });
    await settle(500);
    await vip.page.getByRole('button', { name: /^Card 2$/ }).click();
    await vip.page.getByRole('button', { name: /deal me another/i }).click();
    await settle(300);
    await shots.shot(vip.page, {
      group: G,
      phase: 'intro-2-swapped',
      device: 'iphone',
      role: 'vip',
    });
    await api.skip();
    await api.skip();
    await settle(500);
    await vip.page.getByRole('button', { name: /style/i }).first().click();
    await settle(300);
    await shots.shot(vip.page, { group: G, phase: 'sheet-2', device: 'iphone', role: 'vip' });
    await vip.page.getByRole('button', { name: /^Stack/ }).click();
    await settle(300);
    await shots.shot(vip.page, { group: G, phase: 'stack', device: 'iphone', role: 'vip' });
    await vip.page.getByRole('button', { name: /^Confirm$/ }).click();
    await settle(3600);
    await side.page.getByRole('button', { name: /style/i }).first().click();
    await settle(300);
    await side.page.getByRole('button', { name: /^Side by side/ }).click();
    await settle(300);
    await shots.shot(side.page, { group: G, phase: 'side', device: 'landscape', role: 'leo' });
    await side.page.getByRole('button', { name: /^Confirm$/ }).click();
    await settle(3600);
    // Leo arms card 1, Sam queues on his card 2, Leo claims (a check): the queue clears.
    await side.page.getByRole('button', { name: /^BINGO! card 1$/i }).click();
    await settle(200);
    await vip.page.getByRole('button', { name: /^BINGO! card 2$/i }).click();
    await settle(200);
    await shots.shot(
      vip.page,
      { group: G, phase: 'stack-queued', device: 'iphone', role: 'vip' },
      { settleMs: 0 },
    );
    // Leo's second tap must land inside his 3 s window: no more stills before it.
    await side.page.getByRole('button', { name: /tap again to claim/i }).dispatchEvent('click');
    await settle(1500);
    await shots.shot(tv, { group: G, phase: 'check-2', device: 'tv', role: 'stage' });
    await shots.shot(side.page, { group: G, phase: 'check-2', device: 'landscape', role: 'leo' });
    await shots.shot(vip.page, { group: G, phase: 'check-2', device: 'iphone', role: 'vip' });
    await api.skip(); // the check ends → next number
    await settle(800);
    await shots.shot(side.page, { group: G, phase: 'wiped-2', device: 'landscape', role: 'leo' });
    await tv.close();
    await vip.page.close();
    await side.page.close();
    // ── three cards: the Grid's spare slot ──
    await api.reset();
    const tv3 = await openTv(browser, server.url);
    await passAudioGate(tv3);
    const p = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(p, api, { avatarIndex: 2 });
    await api.bots(2, 'idle');
    await api.post('/api/dev/start', {
      gameId: G,
      seed: 5,
      settings: { rounds: 1, round1: 'corners', cards: 3, callSeconds: 6 },
    });
    await settle(500);
    await shots.shot(p.page, { group: G, phase: 'intro-3', device: 'iphone', role: 'vip' });
    await api.skip();
    await api.skip();
    await settle(400);
    await p.page.getByRole('button', { name: /style/i }).first().click();
    await settle(300);
    await p.page.getByRole('button', { name: /^Grid/ }).click();
    await settle(300);
    await p.page.getByRole('button', { name: /^Confirm$/ }).click();
    await settle(3600);
    await shots.shot(p.page, { group: G, phase: 'grid-3', device: 'iphone', role: 'vip' });
    console.log(`captured ${shots.shots.length} stills → ${OUT}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
