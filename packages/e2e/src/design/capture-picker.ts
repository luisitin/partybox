// The lobby and game picker on a real clock (Foundation F1–F3 record-review): the TV and two phones
// (the VIP and a guest) recorded on video, a still of every surface at every stage, 10 fps strips
// from each stage's first 2.5 s, long frames per stage, and — the point of F1/F2 — what each
// surface downloaded at each stage (net-log.ts). Stages: load → join → lobby → picker → browse →
// about → choose → start → play. Works on the old picker (radio cards) and the new one (rows + ⓘ).
// Usage: tsx packages/e2e/src/design/capture-picker.ts --out <dir> [--port 42300] [--prod] [--build]
//        [--game wisecrack] [--vip iphone] [--guest iphone-se] [--lang es] [--bots 3]
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import type { Browser, BrowserContext, Locator, Page } from 'playwright';
import type { DeviceId } from './devices';
import { DEVICES } from './devices';
import { HOOKS, strip } from './loop-tools';
import { NetLog, formatTotals } from './net-log';
import { Finger } from './touch';
import { startProdServer } from './prod-server';
import { REPO_ROOT, startServer } from './server';
import { CONTEXT_BASE, DevApi, applyDeviceCss, joinViaForm, passAudioGate, phoneUrl, settle } from './session'; // prettier-ignore

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42300' },
    prod: { type: 'boolean', default: false },
    build: { type: 'boolean', default: false },
    game: { type: 'string', default: 'wisecrack' },
    vip: { type: 'string', default: 'iphone' },
    guest: { type: 'string', default: 'iphone-se' },
    lang: { type: 'string', default: 'en' },
    bots: { type: 'string', default: '3' },
  },
});
const OUT =
  values.out ?? join(REPO_ROOT, 'reports', 'design', 'record-review', 'foundation', 'picker');
const GAME = values.game ?? 'wisecrack';
const GAMES = ['bingo', 'blanks', 'broken-pencil', 'lightning-round', 'wisecrack'];

interface Surface {
  id: 'tv' | 'vip' | 'p2';
  context: BrowserContext;
  page: Page;
  net: NetLog;
  t0: number;
}
interface Mark {
  name: string;
  surface: string;
  at: number;
}

async function open(
  browser: Browser,
  id: Surface['id'],
  device: DeviceId,
  url: string,
): Promise<Surface> {
  const spec = DEVICES[device];
  const size = spec.options.viewport ?? { width: 390, height: 844 };
  const context = await browser.newContext({
    ...spec.options,
    ...CONTEXT_BASE,
    ...(values.lang === 'es' ? { locale: 'es-ES' } : {}),
    recordVideo: { dir: join(OUT, 'video', id), size },
  });
  await context.addInitScript(HOOKS);
  const t0 = Date.now();
  const page = await context.newPage();
  const net = await NetLog.attach(context, page);
  await page.goto(id === 'tv' ? `${url}/tv` : await phoneUrl(url));
  await page.waitForSelector(`[data-surface="${id === 'tv' ? 'tv' : 'controller'}"]`);
  await applyDeviceCss(page, device);
  return { id, context, page, net, t0 };
}

/** The first of several locators that is on screen, clicked; false when none is. */
async function clickFirst(locators: Locator[]): Promise<boolean> {
  for (const l of locators) {
    if ((await l.count()) > 0 && (await l.first().isVisible())) {
      await l.first().click();
      return true;
    }
  }
  return false;
}

async function main(): Promise<void> {
  rmSync(join(OUT, 'video'), { recursive: true, force: true });
  rmSync(join(OUT, 'strips'), { recursive: true, force: true });
  mkdirSync(join(OUT, 'stills'), { recursive: true });
  const port = Number(values.port);
  const server = values.prod
    ? await startProdServer(port, { build: values.build })
    : await startServer(port);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const marks: Mark[] = [];
  const surfaces: Surface[] = [];
  const notes: string[] = [];
  let stillN = 0;
  const stage = async (name: string, hold = 900): Promise<void> => {
    const at = Date.now();
    for (const s of surfaces) {
      s.net.stage = name;
      marks.push({ name, surface: s.id, at });
    }
    await settle(hold);
    stillN += 1;
    for (const s of surfaces)
      await s.page.screenshot({
        path: join(OUT, 'stills', `${String(stillN).padStart(2, '0')}-${name}-${s.id}.png`),
      });
  };
  try {
    await api.reset();
    const tv = await open(browser, 'tv', 'tv', server.url);
    surfaces.push(tv);
    await passAudioGate(tv.page);
    const vip = await open(browser, 'vip', values.vip as DeviceId, server.url);
    surfaces.push(vip);
    await stage('load', 600);
    const vipPhone = { device: values.vip as DeviceId, context: vip.context, page: vip.page, name: 'Sam', playerId: null }; // prettier-ignore
    await joinViaForm(vipPhone, api, { avatarIndex: 3 });
    await stage('join');
    const p2 = await open(browser, 'p2', values.guest as DeviceId, server.url);
    surfaces.push(p2);
    await joinViaForm(
      { device: values.guest as DeviceId, context: p2.context, page: p2.page, name: 'Priya', playerId: null },
      api,
      { avatarIndex: 6 },
    ); // prettier-ignore
    await api.bots(Number(values.bots), 'idle');
    await stage('lobby', 1500);

    // Into the picker: the VIP's footer button.
    await vip.page.getByRole('button', { name: /pick a game|elige un juego|elegir juego/i }).first().click(); // prettier-ignore
    await stage('picker', 1500);

    // Browse: a real touch scroll down the list and back (smoothness + overscroll at both ends).
    const finger = await Finger.on(vip.context, vip.page);
    const vp = vip.page.viewportSize() ?? { width: 390, height: 844 };
    const scroll = async (dy: number): Promise<void> => {
      const x = vp.width / 2;
      const y0 = vp.height * (dy < 0 ? 0.75 : 0.3);
      await finger.drag(x, y0, x, y0 + dy * 0.45, 220);
    };
    await stage('browse', 100);
    await scroll(-900);
    await scroll(-900);
    await settle(500);
    await vip.page.screenshot({ path: join(OUT, 'stills', `${String(stillN).padStart(2, '0')}-browse-vip-bottom.png`) }); // prettier-ignore
    await scroll(900);
    await scroll(900);
    await settle(400);
    await finger.detach();

    // About (new picker): the ⓘ on the game's row. The old picker has no About.
    const nameRe = new RegExp(GAME.replace('-', '[ -]'), 'i');
    await stage('about', 50);
    const opened = await clickFirst([
      vip.page.getByRole('button', { name: new RegExp(`^(about|acerca de|info) .*${nameRe.source}`, 'i') }),
    ]); // prettier-ignore
    notes.push(opened ? 'about: opened the sheet' : 'about: no ⓘ button (old picker)');
    await settle(1500);
    await vip.page.screenshot({ path: join(OUT, 'stills', `${String(stillN).padStart(2, '0')}-about-vip-open.png`) }); // prettier-ignore
    await tv.page.screenshot({ path: join(OUT, 'stills', `${String(stillN).padStart(2, '0')}-about-tv-open.png`) }); // prettier-ignore

    // Choose: the sheet's Choose button, the new row, or the old radio card.
    await stage('choose', 50);
    const chose = await clickFirst([
      vip.page.getByRole('button', { name: /^(choose this game|elegir este juego)/i }),
      vip.page.getByRole('button', { name: new RegExp(`^(choose|elegir) .*${nameRe.source}`, 'i') }),
      vip.page.getByRole('radio', { name: nameRe }),
    ]); // prettier-ignore
    if (!chose) notes.push(`choose: no control found for ${GAME}`);
    await settle(2500);
    stillN += 1;
    for (const s of surfaces)
      await s.page.screenshot({ path: join(OUT, 'stills', `${String(stillN).padStart(2, '0')}-chosen-${s.id}.png`) }); // prettier-ignore

    await stage('start', 50);
    const started = await clickFirst([
      vip.page.getByRole('button', { name: /^(start|empezar|comenzar)/i }),
    ]);
    if (!started) notes.push('start: no Start button');
    const until = Date.now() + 15_000;
    while (Date.now() < until && (await api.state()).room?.status !== 'playing') await settle(150);
    await stage('play', 4000);
  } finally {
    const longs: Record<string, { t: number; ms: number }[]> = {};
    for (const s of surfaces) {
      longs[s.id] = ((await s.page.evaluate('window.__pbLong').catch(() => [])) ?? []) as { t: number; ms: number }[]; // prettier-ignore
      await s.net.detach();
    }
    const nets = Object.fromEntries(
      surfaces.map((s) => [s.id, { totals: s.net.totals(GAMES), requests: s.net.requests, frames: s.net.frames }]),
    ); // prettier-ignore
    for (const s of surfaces) await s.context.close();
    await browser.close();
    await server.stop();
    const stageOf = (t: number): string =>
      [...marks].reverse().find((m) => m.at <= t)?.name ?? 'load';
    const t0 = Object.fromEntries(surfaces.map((s) => [s.id, s.t0]));
    writeFileSync(join(OUT, 'marks.json'), JSON.stringify({ t0, marks }, null, 2) + '\n');
    writeFileSync(join(OUT, 'net.json'), JSON.stringify(nets, null, 2) + '\n');
    const timing = Object.fromEntries(
      Object.entries(longs).map(([id, l]) => [
        id,
        { longFrames: l.length, over100: l.filter((x) => x.ms > 100).length, worstMs: Math.max(0, ...l.map((x) => x.ms)), long: l.map((x) => ({ ...x, stage: stageOf(x.t) })) },
      ]),
    ); // prettier-ignore
    writeFileSync(join(OUT, 'frame-timing.json'), JSON.stringify(timing, null, 2) + '\n');
    // Videos → <surface>.webm, strips from every stage mark, dead air per surface.
    for (const s of surfaces) {
      const dir = join(OUT, 'video', s.id);
      const file = readdirSync(dir).find((f) => f.endsWith('.webm'));
      if (!file) continue;
      const video = join(OUT, 'video', `${s.id}.webm`);
      renameSync(join(dir, file), video);
      for (const m of marks.filter((x) => x.surface === s.id))
        strip(video, join(OUT, 'strips', `${m.name}-${s.id}`), (m.at - s.t0) / 1000 - 0.3, 2.5, 10);
      spawnSync('pnpm', ['exec', 'tsx', 'packages/e2e/src/design/dead-air.ts', '--video', video, '--marks', join(OUT, 'marks.json'), '--surface', s.id, '--out', join(OUT, `dead-air-${s.id}.json`)], { cwd: REPO_ROOT, shell: true, stdio: 'ignore' }); // prettier-ignore
    }
    const summary = [
      `capture-picker ${values.prod ? '(production build)' : '(vite dev — bytes are NOT representative)'} game=${GAME} lang=${values.lang} vip=${values.vip} guest=${values.guest}`,
      ...notes,
      ...surfaces.map((s) => formatTotals(s.id, nets[s.id]?.totals ?? {})),
      ...Object.entries(timing).map(([id, t]) => `frames ${id}: ${t.longFrames} over 34 ms, ${t.over100} over 100 ms, worst ${t.worstMs} ms`),
    ].join('\n'); // prettier-ignore
    writeFileSync(join(OUT, 'summary.txt'), summary + '\n');
    console.log(summary);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
