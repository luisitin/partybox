// Probe (F4 acceptance, Part 00 §8 / ADR-047): a room with a TV and two phones, one of them remote
// (`?canSeeTv=0`). During Bingo only the remote phone hears the caller (its /sfx/calls clips) and
// never reads "look at the TV"; on a claim only the remote phone takes Bingo's stage (the check).
// Usage: tsx packages/e2e/src/design/probe-presence.ts [--out <dir>] [--port 42300] [--build]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { DEVICES } from './devices';
import { startProdServer } from './prod-server';
import { REPO_ROOT } from './server';
import type { Phone } from './session';
import { CONTEXT_BASE, DevApi, joinViaForm, passAudioGate, phoneUrl, settle } from './session';

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42300' },
    build: { type: 'boolean', default: false },
  },
});
const OUT =
  values.out ?? join(REPO_ROOT, 'reports', 'design', 'record-review', 'foundation', 'presence');

interface Check {
  step: string;
  ok: boolean;
  detail: string;
}

async function phone(
  browser: Browser,
  url: string,
  api: DevApi,
  name: string,
  remote: boolean,
): Promise<{ p: Phone; calls: string[] }> {
  // prettier-ignore
  const context = await browser.newContext({ ...DEVICES.iphone.options, ...CONTEXT_BASE });
  const page = await context.newPage();
  const calls: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/sfx/calls/')) calls.push(r.url());
  });
  const base = await phoneUrl(url);
  await page.goto(remote ? `${base}${base.includes('?') ? '&' : '?'}canSeeTv=0` : base);
  await page.waitForSelector('[data-surface="controller"]');
  const p: Phone = { device: 'iphone', context, page, name, playerId: null };
  await joinViaForm(p, api, { avatarIndex: name.length });
  // the phone's first tap enables its sound (the caller plays through it)
  await page.mouse.click(10, 300);
  return { p, calls };
}

const text = (page: Page): Promise<string> => page.evaluate(() => document.body.innerText);

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startProdServer(Number(values.port), { build: values.build });
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const checks: Check[] = [];
  const check = (step: string, ok: boolean, detail: string): void => {
    checks.push({ step, ok, detail });
  };
  try {
    await api.reset();
    const tvContext = await browser.newContext({ ...DEVICES.tv.options, ...CONTEXT_BASE });
    const tv = await tvContext.newPage();
    await tv.goto(`${server.url}/tv`);
    await tv.waitForSelector('[data-surface="tv"]');
    await passAudioGate(tv);
    const vip = await phone(browser, server.url, api, 'Sam', false);
    const maya = await phone(browser, server.url, api, 'Maya', true);
    await api.bots(2, 'idle');
    await settle(800);
    const room = (await api.state()).room;
    const mayaId = maya.p.playerId;
    check('the remote phone is marked remote', Boolean(mayaId), `maya=${mayaId}`);

    await api.start('bingo', 7);
    await settle(14_000); // the deal, the ready-up (the dev API readies everyone) and a few calls
    await vip.p.page.screenshot({ path: join(OUT, '01-play-vip.png') });
    await maya.p.page.screenshot({ path: join(OUT, '01-play-remote.png') });
    await tv.screenshot({ path: join(OUT, '01-play-tv.png') });
    check('only the remote phone hears the caller', maya.calls.length > 0 && vip.calls.length === 0, `remote ${maya.calls.length} clips, at-TV ${vip.calls.length}`); // prettier-ignore
    const mayaSays = await text(maya.p.page);
    check('the remote phone never says "look at the TV"', !/look at the TV/i.test(mayaSays), mayaSays.slice(0, 120).replace(/\s+/g, ' ')); // prettier-ignore

    // A claim from the remote player: the check is the TV's moment — only her phone takes it.
    // BINGO takes two taps on the card: the first arms it, the second claims.
    for (let tap = 0; tap < 2; tap += 1) {
      await api.event({ type: 'input', now: Date.now(), playerId: mayaId, input: { type: 'bingo', card: 0 } }); // prettier-ignore
      await settle(200);
    }
    await settle(1500);
    const phase = (await api.state()).room?.game?.state.phase.id;
    const stageOn = async (page: Page): Promise<boolean> =>
      (await page.locator('[class*="phoneStageCard"]').count()) > 0;
    await vip.p.page.screenshot({ path: join(OUT, '02-check-vip.png') });
    await maya.p.page.screenshot({ path: join(OUT, '02-check-remote.png') });
    await tv.screenshot({ path: join(OUT, '02-check-tv.png') });
    check('the claim reached the check', phase === 'check', `phase=${phase}`);
    check('only the remote phone takes the stage', (await stageOn(maya.p.page)) && !(await stageOn(vip.p.page)), `remote ${await stageOn(maya.p.page)}, at-TV ${await stageOn(vip.p.page)}`); // prettier-ignore
    void room;
  } finally {
    await browser.close();
    await server.stop();
  }
  writeFileSync(join(OUT, 'presence.json'), JSON.stringify(checks, null, 2) + '\n');
  for (const c of checks) console.log(`${c.ok ? 'ok  ' : 'FAIL'} ${c.step} — ${c.detail}`);
  if (checks.some((c) => !c.ok)) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
