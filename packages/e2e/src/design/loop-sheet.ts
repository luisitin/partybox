// Contact sheet of a frame strip (review-loop): every Nth frame of `<dir>/fNN.png`, labelled, on one
// PNG next to the strip so a transition can be read at a glance.
// Usage: tsx packages/e2e/src/design/loop-sheet.ts <strip-dir> [--cols 6] [--every 2] [--from 4 --to 8 --width 640]
import { readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    cols: { type: 'string', default: '6' },
    every: { type: 'string', default: '2' },
    from: { type: 'string' },
    to: { type: 'string' },
    width: { type: 'string', default: '320' },
  },
});
const dir = resolve(positionals[0] ?? '.');
const cols = Number(values.cols);
const every = Number(values.every);
const from = values.from ? Number(values.from) : 1;
const to = values.to ? Number(values.to) : Number.POSITIVE_INFINITY;
const w = Number(values.width);
const files = readdirSync(dir)
  .filter((f) => /^f\d+\.png$/.test(f))
  .filter((f) => {
    const n = Number(f.slice(1, -4));
    return n >= from && n <= to;
  })
  .filter((_, i) => i % every === 0);
const cell = (f: string): string =>
  `<div style="position:relative"><img src="${pathToFileURL(join(dir, f)).href}" width="${w}"><span style="position:absolute;left:4px;top:2px;color:#0f0;font:12px monospace">${f}</span></div>`;
const html = `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:4px">${files.map(cell).join('')}</body>`;
const page = join(tmpdir(), `pb-sheet-${Date.now()}.html`);
writeFileSync(page, html);
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: cols * (w + 4), height: 200 } });
await tab.goto(pathToFileURL(page).href);
await tab.waitForLoadState('networkidle');
const range = values.from ? `-${from}-${Number.isFinite(to) ? to : 'end'}` : '';
const out = join(dirname(dir), `${basename(dir)}-sheet${range}.png`);
await tab.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(out);
