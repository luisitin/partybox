// Probe (F1, keep: the loader regression check): the phone's game download fails. A: the connection is back within 3 s → the
// automatic retry (a fresh URL) loads the game with no card. B: it stays down → retries 1/3/6 s →
// "Couldn't load the game. Tap to retry." → the connection comes back → one tap → the game renders.
// Production build on 42300.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import { startProdServer } from './prod-server';
import { REPO_ROOT } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const OUT = join(REPO_ROOT, 'reports', 'design', 'record-review', 'foundation', 'p02-load-fail');
const GAME_ON_PHONE = /round 1 of|get ready to write/i;

async function scenario(
  browser: Browser,
  url: string,
  api: DevApi,
  outageMs: number,
  tag: string,
): Promise<string> {
  await api.reset();
  const tv = await openTv(browser, url);
  await passAudioGate(tv);
  const vip = await openPhone(browser, url, 'iphone-se', 'Sam');
  const log: string[] = [];
  let t0 = Date.now();
  let blockedUntil = Infinity;
  vip.page.on('console', (m) => {
    if (/partybox|import|module/i.test(m.text())) log.push(`console: ${m.text().slice(0, 300)}`);
  });
  vip.page.on('pageerror', (e) => log.push(`pageerror: ${e.message.slice(0, 300)}`));
  vip.page.on('request', (r) => {
    if (/phone-entry/.test(r.url()))
      log.push(`${((Date.now() - t0) / 1000).toFixed(1)}s ${r.url().split('/').pop()}`);
  });
  await vip.context.route(/phone-entry-[^/]+\.js(\?.*)?$/, (route) =>
    Date.now() < blockedUntil ? route.abort('internetdisconnected') : route.continue(),
  );
  await joinViaForm(vip, api, { avatarIndex: 2 });
  await api.bots(2, 'idle');
  await vip.page.getByRole('button', { name: /pick a game/i }).click();
  await settle(500);
  t0 = Date.now();
  blockedUntil = outageMs === Infinity ? Infinity : t0 + outageMs;
  await vip.page.getByRole('radio', { name: /wisecrack/i }).click();
  await settle(300);
  await vip.page.getByRole('button', { name: /^start/i }).click();
  let result: string;
  if (outageMs !== Infinity) {
    await vip.page
      .getByText(GAME_ON_PHONE)
      .first()
      .waitFor({ timeout: 20_000 })
      .catch(async () => {
        await vip.page.screenshot({ path: join(OUT, `${tag}-stuck.png`) });
        console.log(log.join(' | '));
        throw new Error(`${tag}: the game never showed`);
      });
    const card = await vip.page.getByText(/couldn't load the game/i).count();
    result = `${tag}: game on the phone after ${((Date.now() - t0) / 1000).toFixed(1)} s, card shown: ${card > 0}`;
  } else {
    await vip.page.getByText(/couldn't load the game/i).waitFor({ timeout: 30_000 });
    const at = ((Date.now() - t0) / 1000).toFixed(1);
    await vip.page.screenshot({ path: join(OUT, `${tag}-phone-failed.png`) });
    await tv.screenshot({ path: join(OUT, `${tag}-tv-while-phone-failed.png`) });
    blockedUntil = 0;
    await vip.page.getByRole('button', { name: /tap to retry/i }).click();
    // The room played on while this phone was stuck: any Wisecrack screen will do.
    await vip.page.waitForLoadState('load');
    await vip.page
      .locator(
        '[data-surface="controller"] textarea, [data-surface="controller"] input[type="text"]',
      )
      .or(vip.page.getByText(/round \d of|get ready to write|vote|answers are in/i))
      .first()
      .waitFor({ timeout: 20_000 })
      .catch(async () => {
        await vip.page.screenshot({ path: join(OUT, `${tag}-stuck.png`) });
        throw new Error(`${tag}: nothing of the game after the tap`);
      });
    await settle(800);
    await vip.page.screenshot({ path: join(OUT, `${tag}-phone-recovered.png`) });
    result = `${tag}: card after ${at} s; after the tap the game is on the phone`;
  }
  await vip.context.close();
  await tv.context().close();
  return `${result}\n    requests: ${log.join(' | ')}`;
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startProdServer(42300);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    console.log(await scenario(browser, server.url, api, 2500, 'A-short-outage'));
    console.log(await scenario(browser, server.url, api, Infinity, 'B-long-outage'));
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
