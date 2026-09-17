// Browser-side helpers for the design capture: a TV page, phones that join through the real form,
// and a thin dev-API client. The server is started by the caller (`pnpm dev --port 42071`).
import type { Browser, BrowserContext, Page } from 'playwright';
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
    const res = await fetch(`${this.url}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = (await res.json()) as T;
    if (!res.ok) throw new Error(`${path} → ${res.status} ${JSON.stringify(json)}`);
    return json;
  }
  reset = (): Promise<unknown> => this.post('/api/dev/reset');
  bots = (count: number, strategy = 'idle'): Promise<{ playerIds: string[] }> =>
    this.post('/api/dev/bots', { count, strategy });
  start = (gameId: string, seed = 1): Promise<unknown> =>
    this.post('/api/dev/start', { gameId, seed });
  skip = (): Promise<{ phase: string | null; status: string }> => this.post('/api/dev/skip');
  clock = (freeze: boolean, now?: number): Promise<{ now: number }> =>
    this.post('/api/dev/clock', { freeze, now });
  disconnect = (playerId: string, seconds: number): Promise<unknown> =>
    this.post('/api/dev/disconnect', { playerId, seconds });
  event = (event: unknown): Promise<unknown> => this.post('/api/dev/event', { event });
  async state(): Promise<DevState> {
    const res = await fetch(`${this.url}/api/dev/state`);
    return (await res.json()) as DevState;
  }
  async playerId(name: string): Promise<string | null> {
    const s = await this.state();
    return Object.values(s.room?.players ?? {}).find((p) => p.name === name)?.id ?? null;
  }
}

export async function openContext(browser: Browser, device: DeviceId): Promise<BrowserContext> {
  const spec = DEVICES[device];
  return browser.newContext({ ...spec.options, colorScheme: 'dark' });
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
