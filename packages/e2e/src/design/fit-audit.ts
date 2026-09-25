// The "design first" check a still cannot make by eye alone (record-review §3a): what is clipped,
// cut by an ellipsis, past the screen's side, overlapping another control, or smaller than a 44 px
// target — measured on the live page right before its screenshot. Plus `montage`, which tiles stills
// into one image so a sweep (devices × languages × themes) is reviewed a screen at a time.
import { readFileSync } from 'node:fs';
import type { Browser, Page } from 'playwright';

export interface FitReport {
  /** How far the page is wider than the screen (≤ 0 is fine). */
  overflow: number;
  /** Text cut off by its own box or an ancestor's, with no ellipsis to say so. */
  clipped: string[];
  /** Text shortened on purpose (ellipsis or line clamp) — fine if the design means it. */
  ellipsis: string[];
  /** Text or controls past the screen's left or right edge outside a sideways scroller. */
  offscreen: string[];
  /** Two tappable controls on screen, in the same scroller, whose boxes cross. */
  overlaps: string[];
  /** Tappable controls on screen under 44 px in either direction. */
  small: string[];
}

// A string, not a function: tsx wraps named inner functions in `__name(…)`, which the page lacks.
const AUDIT = String.raw`(() => {
  const W = innerWidth, H = innerHeight, CAP = 12;
  const out = { overflow: document.documentElement.scrollWidth - W, clipped: [], ellipsis: [], offscreen: [], overlaps: [], small: [] };
  const push = (list, s) => { if (list.length < CAP && !list.includes(s)) list.push(s); };
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
  const shown = (el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    // Over 1 px: a screen-reader-only label ("(NEW)") is a 1 px clipped box on purpose.
    return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.05;
  };
  const scroller = (el) => {
    for (let a = el.parentElement; a; a = a.parentElement) {
      const o = getComputedStyle(a).overflowY;
      if (o === 'auto' || o === 'scroll') return a;
    }
    return null;
  };
  const clips = (v) => v === 'hidden' || v === 'clip';
  const scrollsX = (el) => {
    for (let a = el.parentElement; a; a = a.parentElement) {
      const o = getComputedStyle(a).overflowX;
      if (o === 'auto' || o === 'scroll') return true;
    }
    return false;
  };
  const hittable = (el) => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (x < 0 || x >= W || y < 0 || y >= H) return false;
    const hit = document.elementFromPoint(x, y);
    return !!hit && (hit === el || el.contains(hit));
  };
  const hasText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const TAPPABLE = 'button, a[href], input, select, textarea, [role=button], [role=radio], [role=checkbox], [role=switch], [role=tab]';
  const taps = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!shown(el)) continue;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (hasText(el)) {
      const clamp = cs.getPropertyValue('-webkit-line-clamp');
      const meant = cs.textOverflow === 'ellipsis' || (clamp && clamp !== 'none');
      if (cs.display !== 'inline') {
        const cutX = clips(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;
        // 4 px: a line clamp's box runs a few px short of its glyphs; a hidden line is ≥ 12 px.
        const cutY = clips(cs.overflowY) && el.scrollHeight > el.clientHeight + 4;
        if (cutX || cutY) push(meant ? out.ellipsis : out.clipped, label(el) + (cutX ? ' [x]' : ' [y]'));
      }
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const acs = getComputedStyle(a);
        // A scroller's rows are scrolled, not cut: the nearest one ends the question.
        if (/auto|scroll/.test(acs.overflowX + acs.overflowY)) break;
        if (!clips(acs.overflowX) && !clips(acs.overflowY)) continue;
        const b = a.getBoundingClientRect();
        // Wholly outside is hidden on purpose (the TV grid's next page); partly outside is cut.
        const meets = r.right > b.left && r.left < b.right && r.bottom > b.top && r.top < b.bottom;
        if (!meets) break;
        const outX = clips(acs.overflowX) && (r.left < b.left - 1 || r.right > b.right + 1);
        const outY = clips(acs.overflowY) && (r.top < b.top - 1 || r.bottom > b.bottom + 1);
        if (outX || outY) push(out.clipped, label(el) + ' (by ' + (a.className || a.tagName).toString().slice(0, 24) + ')');
        break;
      }
      if ((r.right > W + 1 || r.left < -1) && !scrollsX(el)) push(out.offscreen, label(el) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    }
    if (el.matches(TAPPABLE) && hittable(el)) {
      taps.push(el);
      if (r.width < 44 || r.height < 44) push(out.small, label(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
  }
  for (let i = 0; i < taps.length; i++)
    for (let j = i + 1; j < taps.length; j++) {
      const a = taps[i], b = taps[j];
      // A row passing under a pinned footer or a floating hint is scrolling, not a collision.
      if (a.contains(b) || b.contains(a) || scroller(a) !== scroller(b)) continue;
      const p = a.getBoundingClientRect(), q = b.getBoundingClientRect();
      const w = Math.min(p.right, q.right) - Math.max(p.left, q.left);
      const h = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
      if (w > 2 && h > 2) push(out.overlaps, label(a) + ' × ' + label(b));
    }
  return out;
})()`;

export async function auditFit(page: Page): Promise<FitReport> {
  return (await page.evaluate(AUDIT)) as FitReport;
}

/** The findings that fail a still (an ellipsis and a small target are listed, not failed). */
export function fitProblems(r: FitReport): string[] {
  return [
    ...(r.overflow > 0 ? [`page ${r.overflow} px wider than the screen`] : []),
    ...r.clipped.map((s) => `clipped: ${s}`),
    ...r.offscreen.map((s) => `off screen: ${s}`),
    ...r.overlaps.map((s) => `overlap: ${s}`),
  ];
}

export interface Tile {
  path: string;
  label: string;
}

/** Tiles stills (each scaled to `height`) with their labels into one PNG at `out`. */
export async function montage(
  browser: Browser,
  tiles: readonly Tile[],
  out: string,
  height = 460,
): Promise<void> {
  const esc = (s: string): string =>
    s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const figures = tiles
    .map((t) => {
      const src = `data:image/png;base64,${readFileSync(t.path).toString('base64')}`;
      return `<figure><img src="${src}" style="height:${height}px"><figcaption>${esc(t.label)}</figcaption></figure>`;
    })
    .join('');
  const page = await browser.newPage({ viewport: { width: 2400, height: 800 } });
  try {
    await page.setContent(
      `<style>body{margin:0;background:#1b1b1f;color:#ddd;font:15px system-ui}main{display:flex;flex-wrap:wrap;gap:14px;padding:14px}figure{margin:0}img{display:block;border:1px solid #444}figcaption{padding-top:4px}</style><main>${figures}</main>`,
    );
    await page.waitForLoadState('load');
    await page.screenshot({ path: out, fullPage: true });
  } finally {
    await page.close();
  }
}
