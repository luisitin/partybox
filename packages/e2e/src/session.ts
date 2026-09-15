// Browser session helpers: open a TV or a phone with a device preset, join a room through the real
// UI, and collect every console error / page error / React error boundary as a failure.
import type { Browser, BrowserContext, Page } from 'playwright';
import { PRESETS } from './devices';
import type { DevicePreset } from './devices';

export interface Failure {
  page: string;
  kind: 'console' | 'pageerror' | 'boundary';
  text: string;
}

export interface Screen {
  label: string;
  preset: DevicePreset;
  context: BrowserContext;
  page: Page;
  /** Player id once joined (phones only). */
  playerId: string | null;
}

export class Session {
  readonly failures: Failure[] = [];
  readonly screens: Screen[] = [];

  constructor(
    private readonly browser: Browser,
    private readonly baseUrl: string,
  ) {}

  private watch(page: Page, label: string): void {
    page.on('console', (message) => {
      if (message.type() === 'error')
        this.failures.push({ page: label, kind: 'console', text: message.text() });
    });
    page.on('pageerror', (error) =>
      this.failures.push({ page: label, kind: 'pageerror', text: error.message }),
    );
  }

  private async open(label: string, preset: DevicePreset, path: string): Promise<Screen> {
    const spec = PRESETS[preset];
    const context = await this.browser.newContext({
      ...spec.options,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    this.watch(page, label);
    await page.goto(`${this.baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
    if (spec.css) await page.addStyleTag({ content: spec.css });
    const screen: Screen = { label, preset, context, page, playerId: null };
    this.screens.push(screen);
    return screen;
  }

  /** Opens /tv and enables sound (the "tap anywhere for sound" pill goes away on the first gesture). */
  async openTv(preset: DevicePreset = 'tv', label = 'tv'): Promise<Screen> {
    const screen = await this.open(label, preset, '/tv');
    const pill = screen.page.getByRole('button', { name: /tap (to start|anywhere)/i });
    if (await pill.isVisible()) await pill.click();
    return screen;
  }

  /** Opens the controller and joins through the form. */
  async joinPhone(
    preset: DevicePreset,
    name: string,
    avatarId: string,
    label = name,
  ): Promise<Screen> {
    const screen = await this.open(label, preset, '/');
    const { page } = screen;
    await page.getByPlaceholder('e.g. Sam').fill(name);
    await page.getByRole('radio', { name: avatarId }).click();
    await page.getByRole('button', { name: 'Join' }).click();
    await page.getByText(name, { exact: true }).first().waitFor({ timeout: 10_000 });
    return screen;
  }

  /** Reads the React error boundary marker; adds a failure when present. */
  async checkBoundaries(): Promise<void> {
    for (const screen of this.screens) {
      const snag = await screen.page.getByText('This game hit a snag.').count();
      if (snag > 0)
        this.failures.push({
          page: screen.label,
          kind: 'boundary',
          text: 'React error boundary rendered',
        });
    }
  }

  async close(): Promise<void> {
    for (const screen of this.screens) await screen.context.close().catch(() => undefined);
  }
}
