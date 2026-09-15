// Bots-as-players (ADR-028) screens: "Add a bot" on the phone lobby (owner / non-owner / VIP), bot
// rows and Remove, 🤖 chips on the TV, "Bots welcome" / "No bots" on game cards, the Start refusal
// when the selected game does not support bots, and a spectator + bot strip during play.
// Usage: tsx packages/e2e/src/design/capture-bots.ts --out reports/design/<stamp>
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42071' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const G = 'bots';

async function main(): Promise<void> {
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const shots = new Shooter(OUT);
  const browser = await chromium.launch();
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const vip = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(vip, api, { avatarIndex: 3 });
    const other = await openPhone(browser, server.url, 'iphone-se', 'Maximiliano Vega');
    await joinViaForm(other, api, { avatarIndex: 6 });
    const big = await openPhone(browser, server.url, 'font200', 'Kenji');
    await joinViaForm(big, api, { avatarIndex: 9 });
    await settle(300);
    await shots.shot(vip.page, { group: G, phase: 'lobby-no-bots', device: 'iphone', role: 'vip' });

    // VIP adds two bots, Maximiliano adds one, Kenji none.
    for (let i = 0; i < 2; i += 1) {
      await vip.page.getByRole('button', { name: /add a bot/i }).click();
      await settle(300);
    }
    await other.page.getByRole('button', { name: /add a bot/i }).click();
    await settle(500);
    await shots.shot(tv, { group: G, phase: 'lobby', device: 'tv', role: 'stage', note: '3 bots' });
    await shots.shot(vip.page, {
      group: G,
      phase: 'lobby',
      device: 'iphone',
      role: 'vip-owner-of-2',
    });
    await shots.shot(other.page, {
      group: G,
      phase: 'lobby',
      device: 'iphone-se',
      role: 'owner-of-1',
    });
    await shots.shot(big.page, { group: G, phase: 'lobby', device: 'font200', role: 'no-bots' });
    await shots.shot(
      vip.page,
      { group: G, phase: 'lobby-scrolled', device: 'iphone', role: 'vip' },
      { fullPage: true },
    );

    // Selecting: cards say Bots welcome / No bots; Wisecrack refuses to start with bots present.
    await vip.page.getByRole('button', { name: /pick a game/i }).click();
    await settle(500);
    await shots.shot(
      vip.page,
      { group: G, phase: 'selecting', device: 'iphone', role: 'vip' },
      { fullPage: true },
    );
    await shots.shot(tv, { group: G, phase: 'selecting', device: 'tv', role: 'stage' });
    const wisecrack = vip.page.getByRole('radio', { name: /wisecrack/i });
    if (await wisecrack.count()) {
      await wisecrack.click();
      await settle(500);
      await shots.shot(vip.page, {
        group: G,
        phase: 'selecting-refused',
        device: 'iphone',
        role: 'vip',
        note: 'game without supportsBots',
      });
      await shots.shot(tv, { group: G, phase: 'selecting-refused', device: 'tv', role: 'stage' });
    }
    // VIP menu shows bots too
    await vip.page.getByRole('button', { name: /vip/i }).click();
    await shots.shot(
      vip.page,
      { group: G, phase: 'vip-menu', device: 'iphone', role: 'vip' },
      { fullPage: true },
    );
    await vip.page.getByRole('button', { name: /^close$/i }).click();

    // Play Quick Poll (supports bots) with a late spectator: strip shows bots + a dimmed spectator.
    await api.clock(true);
    await api.start('quickpoll', 5);
    await settle(800);
    const late = await openPhone(browser, server.url, 'pixel', 'Late Luca');
    await joinViaForm(late, api, { avatarIndex: 12 });
    await settle(500);
    await shots.shot(tv, {
      group: G,
      phase: 'playing',
      device: 'tv',
      role: 'stage',
      note: 'bots + spectator in the strip',
    });
    await shots.shot(late.page, { group: G, phase: 'playing', device: 'pixel', role: 'spectator' });
    await api.skip();
    await api.skip();
    await settle(1200);
    await shots.shot(tv, {
      group: G,
      phase: 'results',
      device: 'tv',
      role: 'stage',
      note: 'bots on the board',
    });
    await shots.shot(vip.page, { group: G, phase: 'results', device: 'iphone', role: 'vip' });
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
