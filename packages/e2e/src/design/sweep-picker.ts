// Design sweep of the game picker (record-review §3a, Foundation F3): every picker screen — the
// list, its far end, About and its far end, the guest's list while the VIP reads, the guest's
// About, the VIP's chosen screen and its options, the guest's chosen screen, and the TV's grid,
// spotlight and chosen card — on every phone size, in English and Spanish, with every theme on one
// phone and the TV. Each still is fit-audited on the live page (fit-audit.ts) and each screen gets a
// montage, so a sweep is reviewed one screen at a time.
// Usage: tsx packages/e2e/src/design/sweep-picker.ts [--out <dir>] [--port 42300] [--demo] [--build]
//        [--devices iphone-se,iphone,font200,landscape] [--langs en,es] [--themes night,daylight,…]
//        [--game Wisecrack]
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
    demo: { type: 'boolean', default: false },
    build: { type: 'boolean', default: false },
    devices: { type: 'string', default: 'iphone-se,iphone,font200,landscape' },
    langs: { type: 'string', default: 'en,es' },
    themes: { type: 'string', default: 'night,daylight,arcade,cabin,contrast' },
    /** The game read about and chosen, by its name: a real one (a demo entry has no code, so the
     *  room refuses to highlight or choose it). */
    game: { type: 'string', default: 'Wisecrack' },
  },
});
const OUT =
  values.out ?? join(REPO_ROOT, 'reports', 'design', 'record-review', 'foundation', 'sweep');
const DEVICE_IDS = (values.devices ?? '').split(',') as DeviceId[];
const LANGS = (values.langs ?? 'en').split(',');
const THEMES = (values.themes ?? 'night').split(',');
/** Themes are swept on the first phone and the TV, in the first language. */
const THEME_PHONE = DEVICE_IDS[0];
const GAME = values.game ?? 'Wisecrack';

const RX = {
  pick: /^(pick a game|elegir un juego)$/i,
  about: `[aria-label="About ${GAME}"], [aria-label="Sobre ${GAME}"]`,
  choose: `li button[aria-label="Choose ${GAME}"], li button[aria-label="Elegir ${GAME}"]`,
  close: /^(close|cerrar)$/i,
  options: /^(game options|opciones del juego)/i,
};

interface Still {
  file: string;
  lang: string;
  device: string;
  role: string;
  screen: string;
  theme: string;
  fit: FitReport;
  problems: string[];
}
const stills: Still[] = [];
/** The room at each still: a person who dropped (seen once: the VIP mid-choose) is a problem. */
let api: DevApi | null = null;
/** Page loads per phone after its first: a reload (the loader's restart check) shows here. */
const reloads = new Map<string, number>();

async function dropped(): Promise<string[]> {
  const room = (await api?.state())?.room;
  const people = Object.values(room?.players ?? {}) as { name: string; connected: boolean; bot?: unknown }[]; // prettier-ignore
  return people.filter((p) => !p.connected && !p.bot).map((p) => `disconnected: ${p.name}`);
}

async function setTheme(page: Page, theme: string): Promise<void> {
  await page.evaluate((id) => {
    if (id === 'night') delete document.documentElement.dataset['theme'];
    else document.documentElement.dataset['theme'] = id;
  }, theme);
}

/** A still (and its fit audit) of `page`, in every theme when `themed`. */
async function shoot(
  page: Page,
  meta: { lang: string; device: string; role: string; screen: string },
  themed: boolean,
): Promise<void> {
  for (const theme of themed ? THEMES : ['night']) {
    if (themed) await setTheme(page, theme);
    await settle(themed ? 250 : 0);
    const fit = await auditFit(page);
    const room = await dropped();
    const file = `${meta.lang}-${meta.device}-${meta.role}-${meta.screen}${themed ? `-${theme}` : ''}.png`;
    await page.screenshot({ path: join(OUT, file) });
    stills.push({ file, ...meta, theme, fit, problems: [...fitProblems(fit), ...room] });
  }
  if (themed) await setTheme(page, 'night');
}

async function openIn(
  browser: Browser,
  url: string,
  device: DeviceId,
  lang: string,
  path: string,
): Promise<Page> {
  const context = await browser.newContext({
    ...DEVICES[device].options,
    ...CONTEXT_BASE,
    locale: lang === 'es' ? 'es-ES' : 'en-US',
  });
  const page = await context.newPage();
  await page.goto(path.startsWith('http') ? path : `${url}${path}`);
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
  const page = await openIn(browser, url, device, lang, await phoneUrl(url));
  await page.waitForSelector('[data-surface="controller"]');
  const key = `${lang}-${device}-${name}`;
  page.on('load', () => reloads.set(key, (reloads.get(key) ?? 0) + 1));
  // Evidence for a phone that reloads or drops: its errors, the shell's own "[partybox] …" notes
  // (a reload logs its reason), failed or refused requests, and every main-frame navigation.
  const note = (s: string): void => console.log(`[${key} +${Date.now() % 100000}] ${s}`);
  page.on('console', (m) => {
    const text = m.text();
    if (m.type() === 'error' || text.includes('[partybox]')) note(`console ${m.type()}: ${text.slice(0, 200)}`); // prettier-ignore
  });
  page.on('requestfailed', (r) => note(`request failed: ${r.url()} ${r.failure()?.errorText ?? ''}`)); // prettier-ignore
  page.on('response', (r) => {
    if (r.status() >= 400) note(`HTTP ${r.status()} ${r.url()}`);
  });
  page.on('crash', () => note('renderer crashed (out of memory?)'));
  page.on('framenavigated', (f) => {
    if (f === page.mainFrame()) note(`navigated: ${f.url()}`);
  });
  const p: Phone = { device, context: page.context(), page, name, playerId: null };
  await joinViaForm(p, api, { avatarIndex: name.length });
  return p;
}

async function toEnd(page: Page, selector: string): Promise<void> {
  await page.evaluate((sel) => {
    const el = sel ? document.querySelector(sel) : document.scrollingElement;
    el?.scrollTo({ top: el.scrollHeight, behavior: 'instant' });
    // A screen whose list scrolls inside its own box.
    for (const box of document.querySelectorAll('main, [class*="body"], ul'))
      if (box.scrollHeight > box.clientHeight + 4) box.scrollTop = box.scrollHeight;
  }, selector);
  await settle(300);
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
  const tv = withTv ? await openIn(browser, url, 'tv', lang, '/tv') : null;
  if (tv) {
    await tv.waitForSelector('[data-surface="tv"]');
    await passAudioGate(tv);
  }
  const vip = await phone(browser, url, api, device, lang, 'Sam');
  const guest = await phone(browser, url, api, device, lang, 'Priya');
  await api.bots(2, 'idle');
  const themedPhone = device === THEME_PHONE && lang === LANGS[0];
  const themedTv = lang === LANGS[0];
  const at = (role: string, screen: string) => ({ lang, device, role, screen });
  try {
    await vip.page.getByRole('button', { name: RX.pick }).click();
    await settle(1200);
    await shoot(vip.page, at('vip', 'list'), themedPhone);
    await shoot(guest.page, at('guest', 'list'), false);
    if (tv) await shoot(tv, { lang, device: 'tv', role: 'tv', screen: 'grid' }, themedTv);
    await toEnd(vip.page, '');
    await shoot(vip.page, at('vip', 'list-end'), false);
    await vip.page.evaluate(() => {
      for (const box of document.querySelectorAll('main, [class*="body"], ul')) box.scrollTop = 0;
      document.scrollingElement?.scrollTo({ top: 0, behavior: 'instant' });
    });

    await vip.page.locator(RX.about).first().click();
    await settle(900);
    await shoot(vip.page, at('vip', 'about'), themedPhone);
    await shoot(guest.page, at('guest', 'reading'), themedPhone);
    if (tv) await shoot(tv, { lang, device: 'tv', role: 'tv', screen: 'spotlight' }, themedTv);
    await toEnd(vip.page, '[role="dialog"] [class*="body"], [role="dialog"]');
    await shoot(vip.page, at('vip', 'about-end'), false);
    await vip.page.getByRole('button', { name: RX.close }).click();
    await settle(600);

    await guest.page.locator(RX.about).first().click();
    await settle(900);
    await shoot(guest.page, at('guest', 'about'), false);
    await guest.page.getByRole('button', { name: RX.close }).click();
    await settle(600);

    await vip.page.locator(RX.choose).first().click();
    await settle(1400);
    await shoot(vip.page, at('vip', 'chosen'), themedPhone);
    await shoot(guest.page, at('guest', 'chosen'), themedPhone);
    if (tv) await shoot(tv, { lang, device: 'tv', role: 'tv', screen: 'chosen' }, themedTv);
    const options = vip.page.getByRole('button', { name: RX.options });
    if ((await options.count()) > 0) {
      await options.first().click();
      await settle(900);
      await shoot(vip.page, at('vip', 'options'), false);
    }
  } finally {
    for (const p of [vip.page, guest.page, tv]) await p?.context().close();
  }
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startProdServer(Number(values.port), {
    build: values.build,
    env: values.demo ? { PARTYBOX_DEMO_CATALOG: '1' } : {},
  });
  const dev = new DevApi(server.url);
  api = dev;
  const browser = await chromium.launch();
  try {
    for (const lang of LANGS)
      for (const [i, device] of DEVICE_IDS.entries())
        await sweep(browser, server.url, dev, lang, device, i === 0);

    // One montage per screen: every device and language side by side; one per themed screen.
    const screens = [...new Set(stills.map((s) => `${s.role}-${s.screen}`))];
    for (const key of screens) {
      const plain = stills.filter((s) => `${s.role}-${s.screen}` === key && s.theme === 'night');
      const tiles: Tile[] = plain.map((s) => ({ path: join(OUT, s.file), label: `${s.lang} · ${s.device}${s.problems.length ? ' ⚠' : ''}` })); // prettier-ignore
      await montage(browser, tiles, join(OUT, `M-${key}.png`), key.startsWith('tv') ? 300 : 460);
      const themed = stills.filter((s) => `${s.role}-${s.screen}` === key && s.file.endsWith(`-${s.theme}.png`)); // prettier-ignore
      if (themed.length > 1)
        await montage(browser, themed.map((s) => ({ path: join(OUT, s.file), label: s.theme })), join(OUT, `T-${key}.png`), key.startsWith('tv') ? 300 : 460); // prettier-ignore
    }
  } finally {
    await browser.close();
    await server.stop();
  }
  writeFileSync(join(OUT, 'fit.json'), JSON.stringify(stills, null, 2) + '\n');
  let bad = 0;
  for (const s of stills) {
    const notes = [...s.problems, ...s.fit.ellipsis.map((e) => `ellipsis: ${e}`), ...s.fit.small.map((e) => `small: ${e}`)]; // prettier-ignore
    if (s.problems.length) bad += 1;
    if (notes.length) console.log(`${s.problems.length ? 'FAIL' : 'note'} ${s.file}\n  ${notes.join('\n  ')}`); // prettier-ignore
  }
  for (const [key, n] of reloads) console.log(`RELOAD ${key}: ${n} page load(s) after joining`);
  console.log(`${stills.length} stills, ${bad} with problems → ${OUT}`);
  if (bad) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
