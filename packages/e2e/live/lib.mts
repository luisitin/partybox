// Shared helpers for multi-agent live play (each agent = one real browser tab against one server).
// Everything goes through the REAL UI: join form, avatars, TextAnswer / ChoiceGrid / VoteList, VIP menu.
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, devices } from 'playwright';
import type { Browser, BrowserContext, Page } from 'playwright';

export const BASE = process.env.PB_URL ?? 'http://127.0.0.1:42090';
export const OUT = process.env.PB_OUT ?? 'C:/dev/partybox/reports/e2e/live';
mkdirSync(OUT, { recursive: true });

export type Screen =
  | 'join'
  | 'resuming'
  | 'lobby'
  | 'selecting-vip'
  | 'selecting-wait'
  | 'text-answer'
  | 'choices'
  | 'vote'
  | 'waiting'
  | 'spectator'
  | 'results'
  | 'kicked'
  | 'unknown';

export interface Phone {
  name: string;
  context: BrowserContext;
  page: Page;
  playerId: string | null;
  errors: string[];
}

export function logLine(agent: string, event: string, data: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ t: new Date().toISOString(), agent, event, ...data });
  appendFileSync(join(OUT, `${agent}.jsonl`), line + '\n');
  console.log(line);
}

export async function launch(): Promise<Browser> {
  return chromium.launch();
}

const PRESET: Record<string, object> = {
  iphone: devices['iPhone 15'] ?? {
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
  },
  pixel: devices['Pixel 7'] ?? {
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
  },
  se: devices['iPhone SE'] ?? {
    viewport: { width: 320, height: 568 },
    isMobile: true,
    hasTouch: true,
  },
};

function watch(page: Page, errors: string[], agent: string): void {
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(m.text());
      logLine(agent, 'console-error', { text: m.text().slice(0, 300) });
    }
  });
  page.on('pageerror', (e) => {
    errors.push(e.message);
    logLine(agent, 'page-error', { text: e.message.slice(0, 300) });
  });
}

/** Opens a phone and joins through the form. Returns once the header shows the name. */
export async function openPhone(
  browser: Browser,
  agent: string,
  name: string,
  avatar: string,
  preset: keyof typeof PRESET = 'iphone',
): Promise<Phone> {
  const context = await browser.newContext({ ...(PRESET[preset] as object) });
  const page = await context.newPage();
  const errors: string[] = [];
  watch(page, errors, agent);
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('e.g. Sam').fill(name);
  await page.getByRole('radio', { name: avatar }).click();
  await page.getByRole('button', { name: 'Join' }).click();
  await page.locator('header').getByText(name, { exact: true }).waitFor({ timeout: 15_000 });
  const phone: Phone = { name, context, page, playerId: null, errors };
  phone.playerId = await playerIdOf(name);
  logLine(agent, 'joined', { name, playerId: phone.playerId });
  return phone;
}

export async function openTv(
  browser: Browser,
  agent: string,
): Promise<{ context: BrowserContext; page: Page; errors: string[] }> {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const errors: string[] = [];
  watch(page, errors, agent);
  await page.goto(`${BASE}/tv`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /tap (to start|anywhere)/i }).click();
  return { context, page, errors };
}

export interface DevPlayer {
  id: string;
  name: string;
  isVip: boolean;
  connected: boolean;
  spectator: boolean;
}

export interface DevState {
  room: {
    code: string;
    status: string;
    vipId: string | null;
    players: Record<string, DevPlayer>;
    game: {
      gameId: string;
      state: { phase: { id: string; startedAt: number; deadline: number | null } };
    } | null;
    results: unknown;
  } | null;
}

export async function devState(): Promise<DevState> {
  const res = await fetch(`${BASE}/api/dev/state`);
  return (await res.json()) as DevState;
}

export async function playerIdOf(name: string): Promise<string | null> {
  const s = await devState();
  return Object.values(s.room?.players ?? {}).find((p) => p.name === name)?.id ?? null;
}

/** Which screen the phone is showing right now, from DOM probes on the real UI. */
export async function detectScreen(page: Page): Promise<Screen> {
  const has = async (fn: () => Promise<number>): Promise<boolean> =>
    (await fn().catch(() => 0)) > 0;
  if (await has(() => page.getByText('You were removed from the room.').count())) return 'kicked';
  if (await has(() => page.getByText('Reconnecting…').count())) {
    return (await has(() => page.getByPlaceholder('e.g. Sam').count())) ? 'resuming' : 'unknown';
  }
  if (await has(() => page.getByPlaceholder('e.g. Sam').count())) return 'join';
  if (await has(() => page.getByLabel('your answer').count())) return 'text-answer';
  if (await has(() => page.getByRole('radiogroup', { name: 'choices' }).count())) return 'choices';
  if (await has(() => page.getByRole('radiogroup', { name: 'vote' }).count())) return 'vote';
  if (await has(() => page.getByText('Waiting for the next game').count())) return 'spectator';
  if (await has(() => page.getByRole('heading', { name: 'Results' }).count())) return 'results';
  if (await has(() => page.getByRole('heading', { name: 'Pick a game' }).count()))
    return 'selecting-vip';
  if (await has(() => page.getByText(/is choosing a game/).count())) return 'selecting-wait';
  if (await has(() => page.getByRole('heading', { name: 'Lobby' }).count())) return 'lobby';
  if (await has(() => page.getByRole('status').filter({ hasText: /./ }).count())) return 'waiting';
  return 'unknown';
}

export async function isVip(page: Page): Promise<boolean> {
  // Scoped to the header so a "… is now the VIP" toast never reads as the badge.
  return (await page.locator('header').getByRole('button', { name: /VIP/ }).count()) > 0;
}

export async function isReconnecting(page: Page): Promise<boolean> {
  return (await page.getByText('Reconnecting…').count()) > 0;
}

const WORDS = [
  'a very tired llama',
  'my sock drawer',
  'the neighbour trampoline',
  'an aggressively polite goose',
  'seven umbrellas',
  'a spreadsheet of regrets',
  'the wifi password',
  'a haunted vending machine',
  'lukewarm soup',
  'the moon, but closer',
];

/** Acts on whatever input screen is showing; returns what it did (or null when nothing to do). */
export async function actOnce(page: Page, seed: number): Promise<string | null> {
  const screen = await detectScreen(page);
  if (screen === 'text-answer') {
    const text = WORDS[seed % WORDS.length] as string;
    await page.getByLabel('your answer').fill(text);
    // Games label the button per prompt ("Next prompt" / "Submit"); never wait 30 s on a missing one.
    const submit = page.getByRole('button', { name: /^(Submit|Next prompt|Send)/ }).first();
    if (await submit.isEnabled({ timeout: 1500 }).catch(() => false)) {
      await submit.click();
      return `answer:${text}`;
    }
    return null;
  }
  if (screen === 'choices' || screen === 'vote') {
    const radios = page.getByRole('radio');
    const n = await radios.count();
    const enabled: number[] = [];
    for (let i = 0; i < n; i++)
      if (
        await radios
          .nth(i)
          .isEnabled()
          .catch(() => false)
      )
        enabled.push(i);
    if (enabled.length === 0) return null;
    const pick = enabled[seed % enabled.length] as number;
    await radios.nth(pick).click();
    return `${screen}:${pick}`;
  }
  return null;
}

/** VIP flow through the UI: lobby → pick a game → select by name → step settings down → Start. */
export async function vipStartGame(
  page: Page,
  gameName: string,
  stepDown: Record<string, number> = {},
): Promise<void> {
  const lobbyButton = page.getByRole('button', { name: 'Pick a game' });
  if (await lobbyButton.count()) await lobbyButton.click();
  await page.getByRole('radio', { name: new RegExp(gameName) }).click();
  for (const [label, clicks] of Object.entries(stepDown)) {
    const less = page.getByRole('button', { name: `less ${label}` });
    for (let i = 0; i < clicks; i++) await less.click();
  }
  const start = page.getByRole('button', { name: /^Start/ });
  await start.waitFor({ timeout: 10_000 });
  await start.click();
}

export async function screenshot(page: Page, agent: string, label: string): Promise<string> {
  const path = join(OUT, `${agent}-${label}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => undefined);
  return path;
}

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
