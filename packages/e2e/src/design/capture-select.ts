// Game-selection screen on several phones + the TV: the VIP taps "Pick a game", picks one game, and
// each device gets a viewport still and a full-page still of the settings (review-loop, owner request).
// Usage: tsx packages/e2e/src/design/capture-select.ts --out <dir> [--game bingo] [--devices iphone,iphone-se,pixel,galaxy,font200]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { DeviceId } from './devices';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    game: { type: 'string', default: 'bingo' },
    devices: { type: 'string', default: 'iphone,iphone-se,pixel,galaxy,font200' },
    port: { type: 'string', default: '42071' },
  },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'loop', 'select');
const GAME = values.game ?? 'bingo';

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    for (const device of (values.devices ?? '').split(',') as DeviceId[]) {
      await api.reset();
      const tv = await openTv(browser, server.url);
      await passAudioGate(tv);
      const vip = await openPhone(browser, server.url, device, 'Sam');
      await joinViaForm(vip, api, { avatarIndex: 3 });
      await api.bots(2, 'idle');
      await vip.page.getByRole('button', { name: /pick a game/i }).click();
      await settle(400);
      const card = vip.page.getByRole('radio', {
        name: new RegExp(GAME.replace('-', '[ -]'), 'i'),
      });
      if ((await card.count()) > 0) await card.first().click();
      await settle(600);
      await vip.page.screenshot({ path: join(OUT, `${device}-selecting.png`) });
      await vip.page.screenshot({
        path: join(OUT, `${device}-selecting-full.png`),
        fullPage: true,
      });
      const settings = vip.page.getByRole('region', { name: /settings/i });
      if ((await settings.count()) > 0) {
        await settings.first().scrollIntoViewIfNeeded();
        await settle(300);
        await vip.page.screenshot({ path: join(OUT, `${device}-settings.png`) });
        // The list scrolls inside the shell: wheel to the end so the last settings show.
        for (let i = 0; i < 8; i += 1) await vip.page.mouse.wheel(0, 600);
        await settle(400);
        await vip.page.screenshot({ path: join(OUT, `${device}-settings-end.png`) });
      }
      await tv.screenshot({ path: join(OUT, `tv-selecting-${device}.png`) });
      await vip.context.close();
      await tv.context().close();
      console.log(`${device} done`);
    }
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
