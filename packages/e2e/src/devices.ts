// Named device presets (ADR-016). The design session captures every phase on all of them.
import { devices } from 'playwright';
import type { BrowserContextOptions } from 'playwright';

export type DevicePreset =
  'tv' | 'tv4k' | 'iphone' | 'iphone-se' | 'pixel' | 'galaxy' | 'landscape' | 'font200';

export const PHONE_PRESETS: readonly DevicePreset[] = [
  'iphone',
  'iphone-se',
  'pixel',
  'galaxy',
  'landscape',
  'font200',
];

export interface PresetSpec {
  options: BrowserContextOptions;
  /** CSS injected after load; `font200` emulates a 200 % OS font scale on the phone type scale. */
  css?: string;
  label: string;
}

const iphone = devices['iPhone 15'] ??
  devices['iPhone 14'] ?? {
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  };
const iphoneSe = devices['iPhone SE'] ?? {
  viewport: { width: 320, height: 568 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
};
const pixel = devices['Pixel 7'] ??
  devices['Pixel 5'] ?? {
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2.6,
  };
const galaxy = devices['Galaxy S9+'] ?? devices['Galaxy S8'] ?? pixel;

const FONT200_CSS = `:root{--pb-font-display:96px;--pb-font-h1:56px;--pb-font-h2:44px;--pb-font-body:36px;--pb-font-caption:28px;--pb-font-button:40px;--pb-chip-size:80px;}`;

export const PRESETS: Record<DevicePreset, PresetSpec> = {
  tv: { options: { viewport: { width: 1920, height: 1080 } }, label: 'TV 1080p' },
  tv4k: {
    options: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 },
    label: 'TV 4K (2× DPR)',
  },
  iphone: { options: { ...iphone }, label: 'iPhone' },
  'iphone-se': { options: { ...iphoneSe }, label: 'iPhone SE' },
  pixel: { options: { ...pixel }, label: 'Pixel' },
  galaxy: { options: { ...galaxy }, label: 'Galaxy' },
  landscape: {
    options: {
      ...iphone,
      viewport: { width: iphone.viewport?.height ?? 852, height: iphone.viewport?.width ?? 393 },
    },
    label: 'iPhone landscape',
  },
  font200: { options: { ...pixel }, css: FONT200_CSS, label: 'Pixel, 200 % font scale (emulated)' },
};

export function parsePresets(
  raw: string | undefined,
  fallback: readonly DevicePreset[],
): DevicePreset[] {
  if (!raw) return [...fallback];
  const out: DevicePreset[] = [];
  for (const name of raw.split(',').map((s) => s.trim())) {
    if (!(name in PRESETS))
      throw new Error(`unknown device preset "${name}" (${Object.keys(PRESETS).join(', ')})`);
    out.push(name as DevicePreset);
  }
  return out;
}
