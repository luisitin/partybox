// Theme sweep: for every theme, the TV lobby with players, a phone join form, a phone lobby, plus
// the TV theme strip and the phone theme sheet open. Game phases per theme come from
// capture-preview --themes.
// Usage: tsx packages/e2e/src/design/capture-themes.ts --out reports/design/<stamp>
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';
import { Shooter } from './shooter';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42071' },
    themes: { type: 'string', default: 'night,daylight,arcade,cabin,contrast' },
  },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'latest');
const PORT = Number(values.port);
const THEMES = (values.themes ?? 'night').split(',');

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
    await api.bots(5, 'idle');
    const joiner = await openPhone(browser, server.url, 'pixel', 'Priya');
    await settle(500);
    for (const theme of THEMES) {
      await tv.goto(`${server.url}/tv?theme=${theme}`);
      await tv.waitForSelector('[data-surface="tv"]');
      await passAudioGate(tv);
      await settle(600);
      await shots.shot(tv, { group: 'themes', phase: theme, device: 'tv', role: 'lobby' });
      await tv.getByRole('button', { name: /^theme$/i }).click();
      await shots.shot(tv, { group: 'themes', phase: theme, device: 'tv', role: 'picker-open' });
      await tv.getByRole('button', { name: /^theme$/i }).click();
      await vip.page.goto(`${server.url}/?theme=${theme}`);
      await vip.page.waitForSelector('[data-surface="controller"]');
      await settle(800);
      await shots.shot(vip.page, {
        group: 'themes',
        phase: theme,
        device: 'iphone',
        role: 'lobby-vip',
      });
      await vip.page.getByRole('button', { name: /^theme$/i }).click();
      await shots.shot(vip.page, {
        group: 'themes',
        phase: theme,
        device: 'iphone',
        role: 'picker-open',
      });
      await vip.page.getByRole('button', { name: /^close$/i }).click();
      await joiner.page.goto(`${server.url}/?theme=${theme}`);
      await joiner.page.waitForSelector('[data-surface="controller"]');
      await settle(300);
      await shots.shot(joiner.page, {
        group: 'themes',
        phase: theme,
        device: 'pixel',
        role: 'join',
      });
    }
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
