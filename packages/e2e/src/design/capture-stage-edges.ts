// The start stage's edge cases (ADR-053), one recording each, as the reviewer asked [ad0283]: a
// phone that drops unready, someone who joins during the stage, the VIP's phone dropping, the VIP
// alone with bots, ‹ Back, and Wait during the count. Each case films the TV and every phone
// (video), marks its moments, and cuts a strip per mark per surface (10 fps, 2.5 s).
// Usage: tsx packages/e2e/src/design/capture-stage-edges.ts [--out <dir>] [--port 42301] [--build]
//        [--only drop,join,vipdrop,allgone,solo,back,wait]
import { existsSync, mkdirSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import type { Browser, BrowserContext, Page } from 'playwright';
import type { DeviceId } from './devices';
import { DEVICES } from './devices';
import { strip } from './loop-tools';
import { startProdServer } from './prod-server';
import { REPO_ROOT } from './server';
import type { Phone } from './session';
import { CONTEXT_BASE, DevApi, applyDeviceCss, joinViaForm, passAudioGate, phoneUrl, settle } from './session'; // prettier-ignore

const { values } = parseArgs({
  options: {
    out: { type: 'string' },
    port: { type: 'string', default: '42301' },
    build: { type: 'boolean', default: false },
    only: { type: 'string', default: 'drop,join,vipdrop,allgone,solo,back,wait' },
  },
});
const OUT =
  values.out ?? join(REPO_ROOT, 'reports', 'design', 'record-review', 'foundation', 'stage-edges'); // prettier-ignore
const READY = /^(i.m ready|¡listo!)/i;

interface Surface {
  id: string;
  context: BrowserContext;
  page: Page;
  t0: number;
}
interface Mark {
  name: string;
  at: number;
}

class Case {
  readonly surfaces: Surface[] = [];
  readonly marks: Mark[] = [];
  readonly notes: string[] = [];
  constructor(
    readonly name: string,
    readonly browser: Browser,
    readonly url: string,
    readonly api: DevApi,
  ) {}

  private dir(): string {
    return join(OUT, this.name);
  }

  async tv(): Promise<Page> {
    const s = await this.open('tv', 'tv', `${this.url}/tv`);
    await s.page.waitForSelector('[data-surface="tv"]');
    await passAudioGate(s.page);
    return s.page;
  }

  async phone(id: string, name: string, device: DeviceId = 'iphone-se'): Promise<Page> {
    const s = await this.open(id, device, await phoneUrl(this.url));
    await s.page.waitForSelector('[data-surface="controller"]');
    const p: Phone = { device, context: s.context, page: s.page, name, playerId: null };
    await joinViaForm(p, this.api, { avatarIndex: name.length });
    return s.page;
  }

  private async open(id: string, device: DeviceId, url: string): Promise<Surface> {
    const spec = DEVICES[device];
    const size = spec.options.viewport ?? { width: 390, height: 844 };
    const context = await this.browser.newContext({
      ...spec.options,
      ...CONTEXT_BASE,
      recordVideo: { dir: join(this.dir(), 'video', id), size },
    });
    const t0 = Date.now();
    const page = await context.newPage();
    await page.goto(url);
    await applyDeviceCss(page, device);
    const s = { id, context, page, t0 };
    this.surfaces.push(s);
    return s;
  }

  mark(name: string): void {
    this.marks.push({ name, at: Date.now() });
  }

  async ready(page: Page, who: string): Promise<void> {
    // READY while the last step is below the fold: a tap scrolls to the end first (reviewer D1)
    const readAll = page.getByRole('button', { name: /^↓ (read all|lee los)/i });
    if (await readAll.isVisible().catch(() => false)) {
      await readAll.click();
      await settle(900);
    }
    const button = page.getByRole('button', { name: READY });
    if (!(await button.isVisible().catch(() => false))) this.notes.push(`${who}: no READY`);
    else await button.click();
  }

  /** Close every surface, keep each video as <surface>.webm, and cut the strips. */
  async finish(): Promise<void> {
    for (const s of this.surfaces) await s.context.close().catch(() => undefined);
    for (const s of this.surfaces) {
      const dir = join(this.dir(), 'video', s.id);
      const file = existsSync(dir) ? readdirSync(dir).find((f) => f.endsWith('.webm')) : undefined;
      if (!file) continue;
      const video = join(this.dir(), 'video', `${s.id}.webm`);
      renameSync(join(dir, file), video);
      for (const m of this.marks)
        if (m.at >= s.t0)
          strip(video, join(this.dir(), 'strips', `${m.name}-${s.id}`), (m.at - s.t0) / 1000 - 0.3, 2.5, 10); // prettier-ignore
    }
    writeFileSync(join(this.dir(), 'marks.json'), JSON.stringify({ marks: this.marks, notes: this.notes }, null, 2) + '\n'); // prettier-ignore
  }
}

const statusOf = async (api: DevApi): Promise<string> => {
  const s = (await api.state()) as { room?: { status?: string; starting?: unknown } | null };
  return s.room?.starting ? 'starting' : (s.room?.status ?? 'none');
};

async function waitFor(api: DevApi, status: string, ms = 8000): Promise<boolean> {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    if ((await statusOf(api)) === status) return true;
    await settle(150);
  }
  return false;
}

type Scenario = (c: Case) => Promise<void>;

const SCENARIOS: Record<string, Scenario> = {
  // A phone drops before its READY: the count starts without it.
  async drop(c) {
    await c.tv();
    const vip = await c.phone('vip', 'Sam');
    const guest = await c.phone('guest', 'Maya');
    await c.api.bots(1, 'random'); // Wisecrack takes 3; a bot never holds the stage up
    await c.api.post('/api/dev/start', { gameId: 'wisecrack', seed: 2, stage: true });
    await settle(2500);
    c.mark('vip-ready');
    await c.ready(vip, 'vip');
    await settle(2000);
    c.mark('drop');
    await guest.context().close();
    if (!(await waitFor(c.api, 'playing'))) c.notes.push('drop: the game never started');
    await settle(1500);
  },
  // Someone joins while the room reads: they get the rules and a READY, and the count waits.
  async join(c) {
    await c.tv();
    const vip = await c.phone('vip', 'Sam');
    const guest = await c.phone('guest', 'Maya');
    await c.api.bots(1, 'random'); // Wisecrack takes 3; a bot never holds the stage up
    await c.api.post('/api/dev/start', { gameId: 'wisecrack', seed: 2, stage: true });
    await settle(2000);
    await c.ready(vip, 'vip');
    // Leo arrives while Maya is still reading (once everyone is ready the count starts at once)
    c.mark('join');
    const late = await c.phone('late', 'Leo', 'iphone');
    await settle(1500);
    await c.ready(guest, 'guest');
    await settle(2000);
    if ((await statusOf(c.api)) !== 'starting') c.notes.push('join: the count ran without Leo');
    c.mark('late-ready');
    await c.ready(late, 'late');
    if (!(await waitFor(c.api, 'playing'))) c.notes.push('join: the game never started');
    await settle(1500);
  },
  // Every person's phone drops: nothing counts, the TV says what it is waiting for; one comes back.
  async allgone(c) {
    await c.tv();
    const vip = await c.phone('vip', 'Sam');
    const guest = await c.phone('guest', 'Maya');
    await c.api.bots(1, 'random');
    await c.api.post('/api/dev/start', { gameId: 'wisecrack', seed: 2, stage: true });
    await settle(2000);
    await c.ready(vip, 'vip');
    c.mark('all-gone');
    await guest.context().close();
    await vip.context().close();
    await settle(5000);
    if ((await statusOf(c.api)) !== 'starting') c.notes.push('allgone: a game started for nobody');
    c.mark('back');
    const back = await c.phone('back', 'Leo', 'iphone');
    await settle(1500);
    await c.ready(back, 'back');
    if (!(await waitFor(c.api, 'playing'))) c.notes.push('allgone: never started after Leo');
    await settle(1500);
  },
  // The VIP's phone drops unready: nobody waits for it; the TV's host bar still has the controls.
  async vipdrop(c) {
    await c.tv();
    const vip = await c.phone('vip', 'Sam');
    const guest = await c.phone('guest', 'Maya');
    await c.api.bots(1, 'random'); // Wisecrack takes 3; a bot never holds the stage up
    await c.api.post('/api/dev/start', { gameId: 'wisecrack', seed: 2, stage: true });
    await settle(2000);
    await c.ready(guest, 'guest');
    await settle(1500);
    c.mark('vip-drop');
    await vip.context().close();
    if (!(await waitFor(c.api, 'playing'))) c.notes.push('vipdrop: the game never started');
    await settle(1500);
  },
  // The VIP alone with bots: their READY is the room's; still the breath and the 3·2·1.
  async solo(c) {
    await c.tv();
    const vip = await c.phone('vip', 'Sam');
    await c.api.bots(2, 'random');
    await c.api.post('/api/dev/start', { gameId: 'wisecrack', seed: 2, stage: true });
    await settle(2500);
    c.mark('solo-ready');
    await c.ready(vip, 'vip');
    if (!(await waitFor(c.api, 'playing'))) c.notes.push('solo: the game never started');
    await settle(1500);
  },
  // ‹ Back from the phones' view: every screen goes back to the picker, no snap.
  async back(c) {
    await c.tv();
    const vip = await c.phone('vip', 'Sam');
    await c.phone('guest', 'Maya');
    await c.api.bots(1, 'random'); // Wisecrack takes 3; a bot never holds the stage up
    await c.api.post('/api/dev/start', { gameId: 'wisecrack', seed: 2, stage: true });
    await settle(2500);
    c.mark('back');
    await vip.getByRole('button', { name: /^‹ (back|volver)$/i }).click();
    if (!(await waitFor(c.api, 'selecting'))) c.notes.push('back: still in the stage');
    await settle(2000);
  },
  // Wait during the count, then Start now: the count stops, the rules stay, it counts from 3.
  async wait(c) {
    await c.tv();
    const vip = await c.phone('vip', 'Sam');
    const guest = await c.phone('guest', 'Maya');
    await c.api.bots(1, 'random'); // Wisecrack takes 3; a bot never holds the stage up
    await c.api.post('/api/dev/start', { gameId: 'wisecrack', seed: 2, stage: true });
    await settle(2000);
    await c.ready(vip, 'vip');
    await c.ready(guest, 'guest');
    await settle(1300);
    c.mark('wait');
    await vip.getByRole('button', { name: /^(wait|esperen)$/i }).click();
    await settle(3000);
    if ((await statusOf(c.api)) !== 'starting') c.notes.push('wait: the game started anyway');
    c.mark('resume');
    await vip.getByRole('button', { name: /start now|empezar ya/i }).click();
    if (!(await waitFor(c.api, 'playing'))) c.notes.push('wait: the game never started');
    await settle(1500);
  },
};

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startProdServer(Number(values.port), { build: values.build });
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const report: string[] = [];
  try {
    for (const name of (values.only ?? '').split(',')) {
      const scenario = SCENARIOS[name];
      if (!scenario) continue;
      await api.reset();
      const c = new Case(name, browser, server.url, api);
      try {
        await scenario(c);
      } catch (err) {
        c.notes.push(`crashed: ${String(err).slice(0, 200)}`);
      }
      await c.finish();
      report.push(`${name}: ${c.notes.length ? c.notes.join('; ') : 'ok'}`);
    }
  } finally {
    await browser.close();
    await server.stop();
  }
  writeFileSync(join(OUT, 'summary.txt'), report.join('\n') + '\n');
  console.log(report.join('\n'));
  if (report.some((r) => !r.endsWith(': ok'))) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
