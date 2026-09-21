// The hall board's lamp catch (I-014, the owner: "the flicker needs to be a lot smoother … it
// needs to be headlessly tested visually for smoothness and no cuts"): a numeric check, not eyes.
// The real game with the board on; on each new call the current lamp's computed `opacity` and
// `background-color` are sampled every animation frame (~16 ms) through the 320 ms catch, and no
// sample-to-sample jump may exceed 0.25 in opacity or 25 % in RGB distance. Two calls are checked
// (the landing at 190 ms and the catch-up path share the keyframes). Stills at 10 fps too.
// Usage: tsx packages/e2e/src/design/capture-bingo-lamp-smooth.ts [--out <dir>] [--port 42256]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42256' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'bingo-lamp-smooth');
const MAX_OPACITY_STEP = 0.25;
const MAX_COLOUR_STEP = 0.25; // of the RGB cube's diagonal

interface Sample {
  t: number;
  opacity: number;
  rgb: [number, number, number];
}

const SAMPLER = `
  (() => {
    const runs = []; window.__pbLampRuns = runs;
    let watching = null;
    // Any CSS colour (an oklab color-mix computes to oklab() / color()) → RGB through a canvas.
    const ctx = document.createElement('canvas').getContext('2d');
    const rgbOf = (c) => { ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; };
    const watch = (el) => {
      if (watching === el) return; watching = el;
      const run = []; runs.push(run); const t0 = performance.now();
      const tick = () => {
        const cs = getComputedStyle(el);
        run.push({ t: Math.round(performance.now() - t0), opacity: Number(cs.opacity), rgb: rgbOf(cs.backgroundColor) });
        if (performance.now() - t0 < 700) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const scan = () => { const el = document.querySelector('[class*="cellCurrent"]'); if (el && el !== watching) watch(el); };
    new MutationObserver(scan).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
    scan();
  })();
`;

function analyse(run: Sample[]): { opacity: number; colour: number; samples: number; at: number } {
  let opacity = 0;
  let colour = 0;
  let at = 0;
  for (let i = 1; i < run.length; i += 1) {
    const a = run[i - 1] as Sample;
    const b = run[i] as Sample;
    const step = Math.abs(b.opacity - a.opacity);
    if (step > opacity) at = b.t;
    opacity = Math.max(opacity, step);
    const d = Math.hypot(b.rgb[0] - a.rgb[0], b.rgb[1] - a.rgb[1], b.rgb[2] - a.rgb[2]) / 441.67;
    colour = Math.max(colour, d);
  }
  return { opacity, colour, samples: run.length, at };
}

async function main(): Promise<void> {
  const server = await startServer(Number(values.port));
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  let passed = 0;
  let failed = 0;
  const ok = (name: string, cond: boolean, detail: string): void => {
    if (cond) passed += 1;
    else failed += 1;
    console.log(`${cond ? 'ok  ' : 'FAIL'} ${name} — ${detail}`);
  };
  try {
    mkdirSync(OUT, { recursive: true });
    await api.reset();
    const tv = await openTv(browser, server.url);
    await tv.context().addInitScript(SAMPLER);
    await tv.reload();
    await tv.waitForSelector('[data-surface="tv"]');
    await passAudioGate(tv);
    const phone = await openPhone(browser, server.url, 'iphone', 'Sam');
    await joinViaForm(phone, api, { avatarIndex: 1 });
    await api.bots(2, 'idle');
    await api.post('/api/dev/start', {
      gameId: 'bingo',
      seed: 3,
      settings: { showBoard: true, callSeconds: 5 },
    });
    // two real calls, then a third forced by the VIP — three catches sampled (the init script
    // observes `document`: the html element does not exist yet when it runs)
    await settle(9000);
    await tv.screenshot({ path: join(OUT, 'board-lit.png') });
    await settle(5000);
    await api.skip();
    await settle(1500);
    const runs = (await tv.evaluate('window.__pbLampRuns')) as Sample[][];
    const catches = runs.filter((r) => r.length >= 20);
    ok('lamp catches were sampled', catches.length >= 2, `${catches.length} runs of ≥ 20 frames`);
    catches.forEach((run, i) => {
      const a = analyse(run);
      ok(
        `catch ${i + 1}: no opacity cut`,
        a.opacity <= MAX_OPACITY_STEP,
        `largest step ${a.opacity.toFixed(3)} at ${a.at} ms over ${a.samples} frames`,
      );
      ok(
        `catch ${i + 1}: no colour cut`,
        a.colour <= MAX_COLOUR_STEP,
        `largest step ${(a.colour * 100).toFixed(1)} % of the RGB diagonal`,
      );
      const lit = run[run.length - 1] as Sample;
      ok(`catch ${i + 1}: ends lit`, lit.opacity >= 0.99, `final opacity ${lit.opacity}`);
    });
    console.log(`${passed}/${passed + failed} checks passed → ${OUT}`);
    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
