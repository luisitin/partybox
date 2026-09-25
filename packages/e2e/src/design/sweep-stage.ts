// Design sweep of the start stage (ADR-053), the way sweep-presence does F4: a room with a TV, the
// VIP's phone and a guest's, on every phone size, in English and Spanish. Stills: the rules on the
// VIP's and the guest's phone, the TV with nobody ready, the VIP ready (the guest still reading,
// the TV's faces half lit), the 3·2·1 on phone and TV, and the VIP's Wait (the count held). Each
// still is fit-audited (the count's big number is exempt: it's meant to be huge); each screen gets
// a montage.
// Usage: tsx packages/e2e/src/design/sweep-stage.ts [--out <dir>] [--port 42301] [--build]
//        [--devices iphone-se,iphone,font200,landscape] [--langs en,es] [--game wisecrack]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import type { DeviceId } from './devices';
import { DEVICES } from './devices';
import type { FitReport, Tile } from './fit-audit';
import { auditFit, fitProblems, montage } from './fit-audit';
import { startProdServer } from './prod-server';
import { REPO_ROOT } from './server';
import type { Phone } from './session';
import { CONTEXT_BASE, DevApi, applyDeviceCss, joinViaForm, passAudioGate, phoneUrl, settle } from './session'; // prettier-ignore

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42301' },
    build: { type: 'boolean', default: false },
    devices: { type: 'string', default: 'iphone-se,iphone,font200,landscape' },
    langs: { type: 'string', default: 'en,es' },
    game: { type: 'string', default: 'wisecrack' },
  },
});
const OUT =
  values.out ?? join(REPO_ROOT, 'reports', 'design', 'record-review', 'foundation', 'stage-sweep'); // prettier-ignore
const DEVICE_IDS = (values.devices ?? '').split(',') as DeviceId[];
const LANGS = (values.langs ?? 'en').split(',');
const GAME = values.game ?? 'wisecrack';
const READY = /^(i.m ready|¡listo!)/i;

interface Still {
  file: string;
  screen: string;
  lang: string;
  device: string;
  fit: FitReport;
  problems: string[];
}
const stills: Still[] = [];

async function shoot(page: Page, lang: string, device: string, screen: string): Promise<void> {
  await settle(450);
  const fit = await auditFit(page);
  const file = `${lang}-${device}-${screen}.png`;
  await page.screenshot({ path: join(OUT, file) });
  // the count's numeral is meant to overflow any text box: judge it by eye, not by the audit
  const problems = screen.includes('count') ? [] : fitProblems(fit);
  stills.push({ file, screen, lang, device, fit, problems });
}

async function open(browser: Browser, url: string, device: DeviceId, lang: string): Promise<Page> {
  const context = await browser.newContext({
    ...DEVICES[device].options,
    ...CONTEXT_BASE,
    locale: lang === 'es' ? 'es-ES' : 'en-US',
  });
  const page = await context.newPage();
  await page.goto(url);
  await applyDeviceCss(page, device);
  return page;
}

async function phone(
  browser: Browser,
  url: string,
  api: DevApi,
  device: DeviceId,
  lang: string,
  name: string,
): Promise<Phone> {
  const page = await open(browser, await phoneUrl(url), device, lang);
  await page.waitForSelector('[data-surface="controller"]');
  await applyDeviceCss(page, device);
  const p: Phone = { device, context: page.context(), page, name, playerId: null };
  await joinViaForm(p, api, { avatarIndex: name.length });
  return p;
}

async function sweep(
  browser: Browser,
  url: string,
  api: DevApi,
  lang: string,
  device: DeviceId,
  withTv: boolean,
): Promise<void> {
  await api.reset();
  const tv = withTv ? await open(browser, `${url}/tv`, 'tv', lang) : null;
  if (tv) {
    await tv.waitForSelector('[data-surface="tv"]');
    await passAudioGate(tv);
  }
  const vip = await phone(browser, url, api, device, lang, 'Sam');
  const guest = await phone(browser, url, api, device, lang, 'Maya');
  await api.bots(1, 'idle');
  try {
    // Start through the stage, as the VIP's Start does.
    await api.post('/api/dev/start', { gameId: GAME, seed: 3, stage: true });
    await vip.page.getByRole('button', { name: READY }).waitFor();
    await settle(900); // the swap and the steps' download
    await shoot(vip.page, lang, device, 'rules-vip');
    await shoot(guest.page, lang, device, 'rules-guest');
    if (tv) await shoot(tv, lang, 'tv', 'tv-rules');
    await vip.page.getByRole('button', { name: READY }).click();
    await shoot(vip.page, lang, device, 'vip-ready');
    if (tv) await shoot(tv, lang, 'tv', 'tv-half-ready');
    await guest.page.getByRole('button', { name: READY }).click();
    await settle(1100); // the 0.4 s breath, then into the count
    await shoot(guest.page, lang, device, 'count');
    if (tv) await shoot(tv, lang, 'tv', 'tv-count');
    await vip.page.getByRole('button', { name: /^(wait|esperen)$/i }).click();
    await shoot(vip.page, lang, device, 'held-vip');
    await shoot(guest.page, lang, device, 'held-guest');
    if (tv) await shoot(tv, lang, 'tv', 'tv-held');
  } finally {
    for (const p of [vip.page, guest.page, tv]) await p?.context().close();
  }
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startProdServer(Number(values.port), { build: values.build });
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  try {
    for (const lang of LANGS)
      for (const [i, device] of DEVICE_IDS.entries())
        await sweep(browser, server.url, api, lang, device, i === 0);
    for (const screen of [...new Set(stills.map((s) => s.screen))]) {
      const tiles: Tile[] = stills
        .filter((s) => s.screen === screen)
        .map((s) => ({ path: join(OUT, s.file), label: `${s.lang} · ${s.device}${s.problems.length ? ' ⚠' : ''}` })); // prettier-ignore
      await montage(browser, tiles, join(OUT, `M-${screen}.png`), screen.startsWith('tv') ? 300 : 460); // prettier-ignore
    }
  } finally {
    await browser.close();
    await server.stop();
  }
  writeFileSync(join(OUT, 'fit.jsonl'), stills.map((s) => JSON.stringify(s)).join('\n') + '\n');
  let bad = 0;
  for (const s of stills) {
    if (s.problems.length) bad += 1;
    if (s.problems.length) console.log(`FAIL ${s.file}\n  ${s.problems.join('\n  ')}`);
  }
  console.log(`${stills.length} stills, ${bad} with problems → ${OUT}`);
  if (bad) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
