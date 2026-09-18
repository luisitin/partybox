// Shared pieces of the audio interaction trace (audio-trace.ts): the page hooks armed before the
// app loads, the Tracer (marks, slices, checks, timeline), and page factories with the hooks.
import type { Browser, BrowserContext, Page } from 'playwright';
import { DEVICES } from './devices';
import type { DeviceId } from './devices';
import { skipToLine } from './bingo-lines';
import type { Phone, DevApi } from './session';

export interface Ev {
  t: number;
  kind: string;
  [k: string]: unknown;
}
export interface Check {
  scenario: string;
  check: string;
  pass: boolean;
  detail: string;
}

// Armed before the app loads: the trace sink, a media-element registry (which tracks are audibly
// playing), speech hooks (raw cancel/speak calls, not just the caller's own events).
export const INIT = `
window.__pbTrace = [];
window.__media = [];
(() => {
  const P = HTMLMediaElement.prototype; const op = P.play;
  P.play = function () { if (!window.__media.includes(this)) window.__media.push(this); return op.call(this); };
  if (window.speechSynthesis) {
    const ss = speechSynthesis; const os = ss.speak.bind(ss); const oc = ss.cancel.bind(ss);
    ss.speak = (u) => { window.__pbTrace.push({ t: Math.round(performance.now()), kind: 'ss:speak', text: u.text }); return os(u); };
    ss.cancel = () => { window.__pbTrace.push({ t: Math.round(performance.now()), kind: 'ss:cancel', speaking: ss.speaking, pending: ss.pending }); return oc(); };
  }
  if (navigator.vibrate) { const ov = navigator.vibrate.bind(navigator); navigator.vibrate = (p) => { window.__pbTrace.push({ t: Math.round(performance.now()), kind: 'vibrate', pattern: p }); return ov(p); }; }
})();
window.__playing = () => window.__media.filter((e) => !e.paused && !e.ended).map((e) => ({ track: (e.src || '').split('/').pop(), vol: +e.volume.toFixed(2), t: +e.currentTime.toFixed(1) }));
window.__mark = (label, extra) => window.__pbTrace.push({ t: Math.round(performance.now()), kind: 'mark', label, ...(extra || {}) });
`;

export class Tracer {
  readonly checks: Check[] = [];
  readonly lines: string[] = [];
  constructor(
    readonly tv: Page,
    readonly phones: Phone[],
    readonly api: DevApi,
  ) {}
  async mark(label: string): Promise<void> {
    const s = await this.api.state();
    const extra = { status: s.room?.status ?? null, phase: s.room?.game?.state.phase.id ?? null };
    await this.tv.evaluate(`window.__mark(${JSON.stringify(label)}, ${JSON.stringify(extra)})`);
    for (const p of this.phones)
      await p.page.evaluate(`window.__mark(${JSON.stringify(label)}, ${JSON.stringify(extra)})`);
  }
  trace(page: Page): Promise<Ev[]> {
    return page.evaluate('window.__pbTrace') as Promise<Ev[]>;
  }
  playing(page: Page): Promise<{ track: string; vol: number; t: number }[]> {
    return page.evaluate('window.__playing()') as Promise<
      { track: string; vol: number; t: number }[]
    >;
  }
  /** Events on `page` between two marks (the last occurrence of `from`, the first `to` after it). */
  async between(page: Page, from: string, to: string | null): Promise<Ev[]> {
    const all = await this.trace(page);
    const i = all.map((e) => (e.kind === 'mark' ? e['label'] : null)).lastIndexOf(from);
    if (i < 0) return [];
    const rest = all.slice(i + 1);
    const j = to ? rest.findIndex((e) => e.kind === 'mark' && e['label'] === to) : -1;
    return j < 0 ? rest : rest.slice(0, j);
  }
  cues(evs: Ev[], surface = 'tv'): string[] {
    return evs
      .filter((e) => e.kind === 'cue' && e['surface'] === surface)
      .map((e) => String(e['cue']));
  }
  ok(scenario: string, check: string, pass: boolean, detail = ''): void {
    this.checks.push({ scenario, check, pass, detail });
    this.lines.push(`- ${pass ? '✅' : '❌'} **${check}** ${detail ? `— ${detail}` : ''}`);
  }
  section(title: string): void {
    this.lines.push('', `## ${title}`, '');
  }
  timeline(evs: Ev[], surface: string): void {
    const rows = evs
      .filter((e) => e.kind !== 'mark')
      .map((e) => {
        const rest = Object.entries(e)
          .filter(([k]) => !['t', 'kind'].includes(k))
          .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
          .join(' ');
        return `${String(e.t).padStart(7)} ${surface.padEnd(5)} ${e.kind.padEnd(12)} ${rest}`;
      });
    if (rows.length) this.lines.push('```', ...rows, '```');
  }
}

export async function bingoLine(
  api: DevApi,
  vipId: string,
): Promise<{ line: number[]; card: number[] }> {
  return skipToLine(api, vipId);
}

export interface Pages {
  browser: Browser;
  url: string;
  contexts: BrowserContext[];
}

export async function openTvTraced(p: Pages): Promise<Page> {
  const ctx = await p.browser.newContext({ viewport: { width: 1920, height: 1080 } });
  p.contexts.push(ctx);
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  await page.goto(`${p.url}/tv`);
  await page.waitForSelector('[data-surface="tv"]');
  return page;
}

/** Like session.openPhone, but the hooks are armed before the app loads. */
export async function openPhoneTraced(p: Pages, device: DeviceId, name: string): Promise<Phone> {
  const ctx = await p.browser.newContext({ ...DEVICES[device].options, colorScheme: 'dark' });
  p.contexts.push(ctx);
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  await page.goto(`${p.url}/`);
  await page.waitForSelector('[data-surface="controller"]');
  return { device, context: ctx, page, name, playerId: null };
}
