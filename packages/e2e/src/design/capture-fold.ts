// The phone body's scroll fold: six-player Lightning Round results overflow Sam's iPhone
// and the awards line was cut mid-glyph. Proves the fade is on while there is more to scroll, off
// at the end of the list, and absent on a body that fits (three players).
// Usage: tsx packages/e2e/src/design/capture-fold.ts [--port 42117]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({ options: { port: { type: 'string', default: '42117' } } });
const OUT = join(REPO_ROOT, 'reports', 'design', 'fold');
mkdirSync(OUT, { recursive: true });

interface Fold {
  scrollable: boolean;
  fold: string;
  atEnd: boolean;
}
const READ = `(() => {
  const body = document.querySelector('main section > div');
  if (!body) return null;
  const cs = getComputedStyle(body);
  return {
    scrollable: body.scrollHeight > body.clientHeight + 1,
    fold: cs.getPropertyValue('--pb-fold').trim(),
    atEnd: body.scrollTop + body.clientHeight >= body.scrollHeight - 1,
  };
})()`;

let passed = 0;
let failed = 0;
function check(label: string, ok: boolean, detail = ''): void {
  if (ok) passed += 1;
  else failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
}

async function scene(browser: Browser, url: string, api: DevApi, bots: number): Promise<Page> {
  await api.reset();
  const tv = await openTv(browser, url);
  await passAudioGate(tv);
  const sam = await openPhone(browser, url, 'iphone', 'Sam');
  await joinViaForm(sam, api, { avatarIndex: 1 });
  const priya = await openPhone(browser, url, 'pixel', 'Priya');
  await joinViaForm(priya, api, { avatarIndex: 4 });
  await api.bots(bots, 'fast');
  await api.post('/api/dev/start', {
    gameId: 'lightning-round',
    seed: 7,
    settings: { questions: 3 },
  });
  for (let i = 0; i < 40; i += 1) {
    const s = await api.state();
    if (s.room?.status === 'results') {
      await settle(1200);
      return sam.page;
    }
    await api.post('/api/dev/act', {}).catch(() => undefined);
    await api.skip();
    await settle(250);
  }
  throw new Error('never reached results');
}

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    const page = await scene(browser, server.url, api, 4);
    await page.screenshot({ path: join(OUT, 'six-top.png') });
    let f = (await page.evaluate(READ)) as Fold | null;
    check('six players: the results body scrolls', f?.scrollable === true, JSON.stringify(f));
    check('six players: fold fade on at the top', f?.fold === '28px', f?.fold);
    await page.evaluate(`document.querySelector('main section > div').scrollTo(0, 1e6)`);
    await settle(300);
    await page.screenshot({ path: join(OUT, 'six-end.png') });
    f = (await page.evaluate(READ)) as Fold | null;
    check('six players: at the end of the list', f?.atEnd === true, JSON.stringify(f));
    check('six players: fold fade lifted at the end', f?.fold === '0px', f?.fold);
    const award = await page.locator('main li strong').first().boundingBox();
    const footer = await page.locator('main section > div + div').first().boundingBox();
    check(
      'six players: the award line sits above the footer once scrolled',
      award !== null && footer !== null && award.y + award.height <= footer.y,
      `award bottom ${award ? (award.y + award.height).toFixed(0) : '?'}, footer top ${footer?.y.toFixed(0)}`,
    );

    const three = await scene(browser, server.url, api, 1);
    await three.screenshot({ path: join(OUT, 'three.png') });
    f = (await three.evaluate(READ)) as Fold | null;
    check('three players: the body fits', f?.scrollable === false, JSON.stringify(f));
    check('three players: no fold fade', f?.fold === '0px' || f?.fold === '', f?.fold);
    console.log(`${passed}/${passed + failed} checks passed → reports/design/fold/`);
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
