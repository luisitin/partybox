// The outgoing host panel's <select> during the select → intro crossfade: the ghost snapshot used
// to print every option's label run together ("All categoriesGeographySTEM…") under the intro
// title for a beat. Picks STEM on the TV panel, starts the game and reads the TV's text every
// 20 ms through the crossfade.
// Usage: tsx packages/e2e/src/design/capture-ghost-select.ts [--port 42123]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({ options: { port: { type: 'string', default: '42123' } } });
const OUT = join(REPO_ROOT, 'reports', 'design', 'ghost-select');
mkdirSync(OUT, { recursive: true });

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  let failed = 0;
  const check = (label: string, ok: boolean, detail: string): void => {
    if (!ok) failed += 1;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} — ${detail}`);
  };
  try {
    await api.reset();
    const tv = await openTv(browser, server.url);
    await passAudioGate(tv);
    const sam = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(sam, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    // The VIP picks Lightning Round and STEM on the phone; the TV mirrors the panel.
    await sam.page.getByRole('button', { name: /pick a game/i }).click();
    await sam.page.getByRole('radio', { name: /lightning[ -]round/i }).click();
    await settle(400);
    await sam.page.getByLabel(/^category/i).selectOption('stem');
    await settle(600);
    const panel = (await tv.evaluate('document.body.innerText')) as string;
    check(
      'the live TV panel shows the picked category',
      /\bSTEM\b/.test(panel),
      'STEM on the panel',
    );
    await sam.page.getByRole('button', { name: /start lightning round/i }).click();
    const seen: string[] = [];
    let runOn = false;
    let ghostLabel = false;
    const until = Date.now() + 900;
    let shot = false;
    while (Date.now() < until) {
      const text = (await tv.evaluate('document.body.innerText')) as string;
      if (/All categoriesGeography/.test(text)) runOn = true;
      // the ghost's replaced select: the picked label alone inside the outgoing panel
      if (/Category[\s\S]{0,200}\bSTEM\b/.test(text) && /Lightning Round/.test(text))
        ghostLabel = true;
      if (!shot && /Category/.test(text) && /Lightning Round/.test(text)) {
        shot = true;
        await tv.screenshot({ path: join(OUT, 'crossfade.png') });
      }
      seen.push(text.slice(0, 40));
      await settle(20);
    }
    check('no option list run together under the intro', !runOn, `polls=${seen.length}`);
    check('the ghost panel keeps the picked label alone', ghostLabel, 'STEM near Category');
    console.log(
      failed ? `${failed} check(s) failed` : '3/3 checks passed → reports/design/ghost-select/',
    );
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
