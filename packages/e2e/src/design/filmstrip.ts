// Stitches a folder of burst frames (tv-t0.png, tv-t1.png, …) into one labelled strip, so an
// animation can be checked frame by frame in a single image — the design session's motion proof.
// Usage: tsx packages/e2e/src/design/filmstrip.ts --dir <folder with tv-tN.png> --gap <ms between frames> [--cols 5] [--out strip.png]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

const { values } = parseArgs({
  options: {
    dir: { type: 'string' },
    gap: { type: 'string', default: '300' },
    cols: { type: 'string', default: '5' },
    out: { type: 'string' },
    width: { type: 'string', default: '384' },
  },
});
if (!values.dir) throw new Error('--dir is required');
const dir = resolve(values.dir);
const gap = Number(values.gap);
const cols = Number(values.cols);
const width = Number(values.width);
const frames = readdirSync(dir)
  .filter((f) => /^(tv-t|f)\d+\.png$/.test(f)) // burst stills, or 10 fps video frames (loop-tools strip)
  .sort((a, b) => Number(/\d+/.exec(a)?.[0]) - Number(/\d+/.exec(b)?.[0]));
if (frames.length === 0) throw new Error(`no tv-tN.png / fNN.png frames in ${dir}`);
const out = values.out ?? join(dir, 'filmstrip.png');

const cells = frames
  .map((f, i) => {
    const b64 = readFileSync(join(dir, f)).toString('base64');
    return `<figure><img src="data:image/png;base64,${b64}" /><figcaption>t${i} · +${i * gap} ms</figcaption></figure>`;
  })
  .join('');
const html = `<!doctype html><html><head><style>
  body { margin: 0; background: #111; color: #eee; font: 600 13px system-ui, sans-serif; }
  main { display: grid; grid-template-columns: repeat(${cols}, ${width}px); gap: 8px; padding: 8px; width: max-content; }
  figure { margin: 0; } img { width: ${width}px; display: block; border-radius: 4px; }
  figcaption { padding: 3px 2px; color: #bbb; }
</style></head><body><main>${cells}</main></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: cols * (width + 8) + 16, height: 600 } });
await page.setContent(html);
const main = page.locator('main');
await main.screenshot({ path: out });
await browser.close();
console.log(`${frames.length} frames → ${out}${existsSync(out) ? '' : ' (missing?)'}`);
