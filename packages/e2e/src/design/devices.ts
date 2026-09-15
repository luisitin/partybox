// Device presets for the design-review capture (docs/DESIGN_SYSTEM.md rubric). One TV at 1080p,
// one at 4K (2× DPR), and six phones: current iPhone, iPhone SE, Pixel, Galaxy, a 200 % font-scale
// phone and a landscape phone. `css` is injected after load to emulate what Playwright cannot.
import { devices } from 'playwright';
import type { BrowserContextOptions } from 'playwright';

export type DeviceId =
  'tv' | 'tv4k' | 'iphone' | 'iphone-se' | 'pixel' | 'galaxy' | 'font200' | 'landscape';

export interface DeviceSpec {
  id: DeviceId;
  label: string;
  options: BrowserContextOptions;
  css?: string;
}

const phone = (name: string, fallback: BrowserContextOptions): BrowserContextOptions =>
  devices[name] ? { ...devices[name] } : fallback;

const iphone = phone('iPhone 15', {
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const iphoneSe = phone('iPhone SE', {
  viewport: { width: 320, height: 568 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const pixel = phone('Pixel 7', {
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});
const galaxy = phone('Galaxy S9+', {
  viewport: { width: 320, height: 658 },
  deviceScaleFactor: 4.5,
  isMobile: true,
  hasTouch: true,
});

// A 200 % OS font scale doubles every rem/px the OS controls; the app sets px tokens, so emulate by
// doubling the phone type column (what iOS "Larger Text" does to text-size-adjust-aware pages).
const FONT200_CSS = `:root{--pb-font-display:96px;--pb-font-h1:56px;--pb-font-h2:44px;--pb-font-body:36px;--pb-font-caption:28px;--pb-font-button:40px;--pb-chip-size:80px;}`;

export const DEVICES: Record<DeviceId, DeviceSpec> = {
  tv: { id: 'tv', label: 'TV 1080p', options: { viewport: { width: 1920, height: 1080 } } },
  tv4k: {
    id: 'tv4k',
    label: 'TV 4K (2× DPR)',
    options: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 },
  },
  iphone: { id: 'iphone', label: 'iPhone 15', options: iphone },
  'iphone-se': { id: 'iphone-se', label: 'iPhone SE', options: iphoneSe },
  pixel: { id: 'pixel', label: 'Pixel 7', options: pixel },
  galaxy: { id: 'galaxy', label: 'Galaxy S9+', options: galaxy },
  font200: { id: 'font200', label: 'Pixel 7 · 200 % font', options: pixel, css: FONT200_CSS },
  landscape: {
    id: 'landscape',
    label: 'iPhone 15 landscape',
    options: {
      ...iphone,
      viewport: { width: iphone.viewport?.height ?? 852, height: iphone.viewport?.width ?? 393 },
    },
  },
};

export const PHONES: readonly DeviceId[] = [
  'iphone',
  'iphone-se',
  'pixel',
  'galaxy',
  'font200',
  'landscape',
];
