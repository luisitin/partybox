// Browser-side helpers for the design capture: a TV page, phones that join through the real form,
// and a thin dev-API client. The server is started by the caller (`pnpm dev --port 42071`).
import type { Browser, BrowserContext, Page } from 'playwright';
import { PLAYER_NAME_MAX } from '@partybox/shared';
import type { DeviceId } from './devices';
import { DEVICES } from './devices';

export interface Phone {
  device: DeviceId;
  context: BrowserContext;
  page: Page;
  name: string;
  playerId: string | null;
}

export interface DevState {
  room: {
    code: string;
    status: string;
    vipId?: string | null;
    players: Record<string, { id: string; name: string; connected: boolean }>;
    game?: { state: { phase: { id: string; deadline: number | null; startedAt?: number } } } | null;
  } | null;
  clock: { now: number; frozen: boolean };
  bots: string[];
}

export class DevApi {
  constructor(readonly url: string) {}
  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    // Bingo's card-pick step (loop 344) waits up to 15 s for every person to tap Ready. The
    // harness's phones never tap, so a Bingo start readies them 1.2 s in (after the deal) through
    // the dev API's act — only while the intro is still on — which keeps the first number at the
    // 5 s every script was written for. `readyUp: false` on the start body leaves them picking.
    const b = (body ?? {}) as { gameId?: string; readyUp?: boolean };
    const bingo = path === '/api/dev/start' && b.gameId === 'bingo';
    const { readyUp, ...clean } = b;
    const res = await fetch(`${this.url}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(bingo ? clean : body),
    });
    const json = (await res.json()) as T;
    if (!res.ok) throw new Error(`${path} → ${res.status} ${JSON.stringify(json)}`);
    if (bingo && readyUp !== false)
      setTimeout(() => {
        void this.readyAll().catch(() => undefined);
      }, 1200);
    return json;
  }
  /** Every person taps Ready at the card-pick step — a no-op once the intro is over. */
  readyAll = async (): Promise<void> => {
    const s = await this.state();
    if (s.room?.game?.state.phase.id === 'intro') await this.post('/api/dev/act', {});
  };
  reset = (): Promise<unknown> => this.post('/api/dev/reset');
  bots = (count: number, strategy = 'idle'): Promise<{ playerIds: string[] }> =>
    this.post('/api/dev/bots', { count, strategy });
  start = (gameId: string, seed = 1): Promise<unknown> =>
    this.post('/api/dev/start', { gameId, seed });
  skip = (): Promise<{ phase: string | null; status: string }> => this.post('/api/dev/skip');
  vip = (action: 'pause' | 'resume' | 'skip' | 'end'): Promise<unknown> =>
    this.post('/api/dev/vip', { action });
  clock = (freeze: boolean, now?: number): Promise<{ now: number }> =>
    this.post('/api/dev/clock', { freeze, now });
  /**
   * Frozen clock only: moves `now` forward by `ms`, so a deadline that is due fires — the way to
   * reach a server beat (Bingo's verdict tick, loop 258) at a chosen real moment without the jump
   * that unfreezing makes (`now` leaps to real time and every pending deadline fires at once).
   */
  advance = async (ms: number): Promise<void> => {
    const s = await this.state();
    await this.clock(true, s.clock.now + ms);
  };
  disconnect = (playerId: string, seconds: number): Promise<unknown> =>
    this.post('/api/dev/disconnect', { playerId, seconds });
  event = (event: unknown): Promise<unknown> => this.post('/api/dev/event', { event });
  async state(): Promise<DevState> {
    const res = await fetch(`${this.url}/api/dev/state`);
    return (await res.json()) as DevState;
  }
  /** The room keeps a name to PLAYER_NAME_MAX characters, so a long PB_NAME_A is looked up by
   *  what the join form kept (loop 632: two 20+ character names left both recorded phones idle). */
  async playerId(name: string): Promise<string | null> {
    const s = await this.state();
    const kept = name.slice(0, PLAYER_NAME_MAX);
    return Object.values(s.room?.players ?? {}).find((p) => p.name === kept)?.id ?? null;
  }
}

/** Every capture context: dark scheme, and PB_MOTION=reduce emulates prefers-reduced-motion so a
 *  live round can be filmed the way a reduced-motion TV or phone plays it (loop 724). */
export const CONTEXT_BASE = {
  colorScheme: 'dark' as const,
  ...(process.env.PB_MOTION === 'reduce' ? { reducedMotion: 'reduce' as const } : {}),
};

export async function openContext(browser: Browser, device: DeviceId): Promise<BrowserContext> {
  const spec = DEVICES[device];
  return browser.newContext({ ...spec.options, ...CONTEXT_BASE });
}

/** Emulation CSS must land AFTER the app's stylesheet (same specificity, later wins). */
export async function applyDeviceCss(page: Page, device: DeviceId): Promise<void> {
  const css = DEVICES[device].css;
  if (css) await page.addStyleTag({ content: css });
}

export async function openTv(
  browser: Browser,
  url: string,
  device: DeviceId = 'tv',
): Promise<Page> {
  const context = await openContext(browser, device);
  const page = await context.newPage();
  await page.goto(`${url}/tv`);
  await page.waitForSelector('[data-surface="tv"]');
  await applyDeviceCss(page, device);
  return page;
}

/** Enable audio (first gesture) so the "tap for sound" pill does not appear in later stills. */
export async function passAudioGate(tv: Page): Promise<void> {
  const gate = tv.getByRole('button', { name: /tap (to start|anywhere)/i });
  if (await gate.isVisible()) await gate.click();
}

export async function openPhone(
  browser: Browser,
  url: string,
  device: DeviceId,
  name: string,
): Promise<Phone> {
  const context = await openContext(browser, device);
  const page = await context.newPage();
  await page.goto(`${url}/`);
  await page.waitForSelector('[data-surface="controller"]');
  await applyDeviceCss(page, device);
  return { device, context, page, name, playerId: null };
}

/** Fill the join form the way a person would. Resolves once the lobby (or an error) is on screen. */
export async function joinViaForm(
  phone: Phone,
  api: DevApi,
  options: { avatarIndex?: number; code?: string; expectError?: boolean } = {},
): Promise<void> {
  const { page } = phone;
  await page.getByLabel(/your name/i).fill(phone.name);
  const avatars = page.getByRole('radio');
  const count = await avatars.count();
  if (count > 0) await avatars.nth((options.avatarIndex ?? 0) % count).click();
  const codeField = page.getByLabel(/room code/i);
  if (options.code && (await codeField.count()) > 0) await codeField.fill(options.code);
  await page.getByRole('button', { name: /^join$/i }).click();
  if (options.expectError) {
    await page.waitForTimeout(600);
    return;
  }
  await page.getByLabel(/your name/i).waitFor({ state: 'detached', timeout: 8000 });
  phone.playerId = await api.playerId(phone.name);
}

export async function settle(ms = 400): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * A TV whose whole session is recorded (Playwright video, 1080p), so a transition can be cut into
 * 10 fps frames afterwards (`cutStrips`): the owner wants at least ten frames a second whenever an
 * animation is examined, and sequential stills cannot deliver that.
 */
export async function openTvRecorded(
  browser: Browser,
  url: string,
  videoDir: string,
): Promise<{ page: Page; context: BrowserContext; t0: number; videoDir: string }> {
  const context = await browser.newContext({
    ...DEVICES.tv.options,
    ...CONTEXT_BASE,
    recordVideo: { dir: videoDir, size: { width: 1920, height: 1080 } },
  });
  const t0 = Date.now();
  const page = await context.newPage();
  await page.goto(`${url}/tv`);
  await page.waitForSelector('[data-surface="tv"]');
  return { page, context, t0, videoDir };
}

/** Close the recorded TV and cut each marked window (`at` = Date.now() of the moment) to 10 fps frames. */
export async function cutStrips(
  tv: { context: BrowserContext; t0: number; videoDir: string },
  stripsDir: string,
  marks: { name: string; at: number; before?: number; seconds?: number; crop?: string }[],
): Promise<string | null> {
  await tv.context.close();
  const { readdirSync, renameSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { strip } = await import('./loop-tools');
  const file = readdirSync(tv.videoDir).find((x) => x.endsWith('.webm'));
  if (!file) return null;
  const video = join(tv.videoDir, 'tv.webm');
  if (file !== 'tv.webm') renameSync(join(tv.videoDir, file), video);
  for (const m of marks) {
    strip(
      video,
      join(stripsDir, m.name),
      (m.at - tv.t0) / 1000 - (m.before ?? 0.3),
      m.seconds ?? 2.5,
      10,
      m.crop,
    );
  }
  return video;
}

/** A phone whose whole session is recorded, for 10 fps strips of its own animations (`cutStrips`). */
export async function openPhoneRecorded(
  browser: Browser,
  url: string,
  device: DeviceId,
  name: string,
  videoDir: string,
): Promise<Phone & { t0: number; videoDir: string }> {
  const spec = DEVICES[device];
  const context = await browser.newContext({
    ...spec.options,
    ...CONTEXT_BASE,
    recordVideo: { dir: videoDir, size: spec.options.viewport ?? { width: 390, height: 844 } },
  });
  const t0 = Date.now();
  const page = await context.newPage();
  await page.goto(`${url}/`);
  await page.waitForSelector('[data-surface="controller"]');
  await applyDeviceCss(page, device);
  return { device, context, page, name, playerId: null, t0, videoDir };
}
