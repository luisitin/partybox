// Design sweep of F4's screens (ADR-047), the way sweep-picker does the picker: a room with a TV,
// the VIP's phone and a remote phone (`?canSeeTv=0`), on every phone size, in English and Spanish.
// Stills: the VIP's "can't see the TV" question in the lobby, the TV asking on its picker, the
// remote phone's "This phone" group, the ★ menu's "Where is everyone?", a guest's phone after the
// switch (no toast, S2) and the TV's chip in each mode (D4). Each
// still is fit-audited; each screen gets a montage.
// Usage: tsx packages/e2e/src/design/sweep-presence.ts [--out <dir>] [--port 42300] [--build]
//        [--devices iphone-se,iphone,font200,landscape] [--langs en,es]
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
    port: { type: 'string', default: '42300' },
    build: { type: 'boolean', default: false },
    devices: { type: 'string', default: 'iphone-se,iphone,font200,landscape' },
    langs: { type: 'string', default: 'en,es' },
  },
});
const OUT =
  values.out ?? join(REPO_ROOT, 'reports', 'design', 'record-review', 'foundation', 'presence-sweep'); // prettier-ignore
const DEVICE_IDS = (values.devices ?? '').split(',') as DeviceId[];
const LANGS = (values.langs ?? 'en').split(',');

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
  await settle(400);
  const fit = await auditFit(page);
  const file = `${lang}-${device}-${screen}.png`;
  await page.screenshot({ path: join(OUT, file) });
  stills.push({ file, screen, lang, device, fit, problems: fitProblems(fit) });
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
  remote: boolean,
): Promise<Phone> {
  const base = await phoneUrl(url);
  const page = await open(browser, url, device, lang);
  await page.goto(remote ? `${base}${base.includes('?') ? '&' : '?'}canSeeTv=0` : base);
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
  const vip = await phone(browser, url, api, device, lang, 'Sam', false);
  const maya = await phone(browser, url, api, device, lang, 'Maya', true);
  // a second remote player: the TV and the VIP must name the same people (reviewer a)
  const kenji = await phone(browser, url, api, device, lang, 'Kenji', true);
  await api.bots(1, 'idle');
  try {
    await shoot(vip.page, lang, device, 'vip-prompt');
    // The TV asks on its picker (where its room switches live).
    await vip.page.getByRole('button', { name: /^(pick a game|elegir un juego)$/i }).click();
    if (tv) await shoot(tv, lang, 'tv', 'tv-ask');
    // The remote phone's own answer, in its 🎨 sheet.
    await maya.page.getByRole('button', { name: /— (theme|tema)$/i }).click();
    await maya.page.getByRole('button', { name: /(I can see the TV|Veo la TV)/i }).scrollIntoViewIfNeeded(); // prettier-ignore
    await shoot(maya.page, lang, device, 'remote-see-tv');
    // The VIP's ★ menu: "Where is everyone?"
    await vip.page.getByRole('button', { name: /★/ }).click();
    const group = vip.page.getByRole('radiogroup', { name: /(where is everyone|dónde está)/i });
    await group.scrollIntoViewIfNeeded();
    await shoot(vip.page, lang, device, 'vip-menu');
    await group.getByRole('radio').nth(1).click();
    await settle(600);
    await shoot(vip.page, lang, device, 'vip-menu-answered');
    // S2: the switch's toast reaches the TV and the VIP only; a guest's screen stays clear.
    await shoot(maya.page, lang, device, 'guest-after-switch');
    // D4: the TV's chip in every mode (1 = on a call, 2 = no call, 0 = back to together).
    for (const [i, mode] of [
      [1, 'remote-voice'],
      [2, 'remote-text'],
      [0, 'together'],
    ] as const) {
      if (i !== 1) await group.getByRole('radio').nth(i).click();
      await settle(600);
      if (tv) await shoot(tv, lang, 'tv', `tv-chip-${mode}`);
    }
  } finally {
    for (const p of [vip.page, maya.page, kenji.page, tv]) await p?.context().close();
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
