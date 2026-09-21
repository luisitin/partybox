// The answer table's landing and turn-up (I-020, the owner: "guarantee smoothness … not smooth"):
// a numeric check, not eyes. The real game's answer phase; every pip that gains `pipDone` is
// sampled every animation frame (~16 ms) for 900 ms — computed opacity and the transform's
// translate — through the drop, the puff beat and, on "Everyone's in!", the turn-up; no
// sample-to-sample jump may exceed 0.25 opacity or 40 px. The turn-up is checked on the same
// element (it must not remount and replay the drop): the pip's sample count keeps growing.
// Usage: tsx packages/e2e/src/design/capture-blanks-table-smooth.ts [--out <dir>] [--port 42258]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { REPO_ROOT, startServer } from './server';
import { DevApi, joinViaForm, openPhone, openTv, passAudioGate, settle } from './session';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42258' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'blanks-table-smooth');
const MAX_OPACITY_STEP = 0.25;
const MAX_TRANSLATE_STEP = 40;

interface Sample {
  t: number;
  opacity: number;
  y: number;
  anim: string;
}

const SAMPLER = `
  (() => {
    const runs = new Map(); window.__pbPipRuns = runs;
    const yOf = (m) => { if (!m || m === 'none') return 0; const p = m.match(/matrix3d\\((.+)\\)/); if (p) return Number(p[1].split(',')[13]); const q = m.match(/matrix\\((.+)\\)/); return q ? Number(q[1].split(',')[5]) : 0; };
    const watch = (el) => {
      if (runs.has(el)) return;
      const run = []; runs.set(el, run); const t0 = performance.now();
      const tick = () => {
        if (!el.isConnected) return; // the phase moved on: the table left the stage
        const cs = getComputedStyle(el);
        run.push({ t: Math.round(performance.now() - t0), opacity: Number(cs.opacity), y: yOf(cs.transform), anim: cs.animationName });
        if (performance.now() - t0 < 12000) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const scan = () => document.querySelectorAll('[class*="pipDone"]').forEach(watch);
    new MutationObserver(scan).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
    scan();
  })();
`;

function analyse(run: Sample[]): { opacity: number; y: number; at: number; anims: string[] } {
  let opacity = 0;
  let y = 0;
  let at = 0;
  const anims: string[] = [];
  for (let i = 1; i < run.length; i += 1) {
    const a = run[i - 1] as Sample;
    const b = run[i] as Sample;
    const step = Math.abs(b.opacity - a.opacity);
    if (step > opacity) at = b.t;
    opacity = Math.max(opacity, step);
    y = Math.max(y, Math.abs(b.y - a.y));
    if (b.anim !== a.anim) anims.push(`${b.t}:${b.anim}`);
  }
  return { opacity, y, at, anims };
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
    await api.bots(3, 'random');
    await api.post('/api/dev/start', { gameId: 'blanks', seed: 5, settings: { rounds: 3 } });
    const phaseNow = async (): Promise<string> =>
      (await api.state()).room?.game?.state.phase.id ?? '';
    for (let i = 0; i < 60 && (await phaseNow()) !== 'answer'; i += 1) await settle(500);
    await settle(2500); // the bots' cards land
    await tv.screenshot({ path: join(OUT, 'table-landing.png') });
    // Sam plays: the last card lands, then "Everyone's in!" turns the table up
    const cards = phone.page.locator('[aria-label="your hand"] button');
    const label =
      (await phone.page
        .getByRole('button', { name: /^(play|pick)/i })
        .first()
        .textContent()
        .catch(() => '')) ?? '';
    const pick = Number(label.match(/\d+/)?.[0] ?? 1);
    for (let k = 0; k < Math.min(pick, await cards.count()); k += 1) {
      await cards
        .nth(k + 1)
        .click()
        .catch(() => undefined);
      await settle(600);
    }
    await phone.page.getByRole('button', { name: /^play/i }).first().click();
    await settle(2500);
    await tv.screenshot({ path: join(OUT, 'table-turned.png') });
    const runs = (await tv.evaluate('[...window.__pbPipRuns.values()]')) as Sample[][];
    const pips = runs.filter((r) => r.length >= 30);
    ok('landed cards were sampled', pips.length >= 3, `${pips.length} pips of ≥ 30 frames`);
    pips.forEach((run, i) => {
      const a = analyse(run);
      ok(
        `pip ${i + 1}: no opacity cut`,
        a.opacity <= MAX_OPACITY_STEP,
        `largest step ${a.opacity.toFixed(3)} at ${a.at} ms over ${run.length} frames`,
      );
      ok(
        `pip ${i + 1}: no translate cut`,
        a.y <= MAX_TRANSLATE_STEP,
        `largest step ${a.y.toFixed(1)} px`,
      );
      // the turn-up runs on the same element: the drop's name is followed by the turn-up's, never
      // by the drop again (a remount would start a new run instead)
      const drops = a.anims.filter((s) => s.includes('drop')).length;
      ok(
        `pip ${i + 1}: the turn-up does not restart the drop`,
        drops === 0,
        `animation changes: ${a.anims.join(' ') || 'none'}`,
      );
      const last = run[run.length - 1] as Sample;
      ok(
        `pip ${i + 1}: ends flat and opaque`,
        last.opacity >= 0.99 && Math.abs(last.y) < 1,
        `opacity ${last.opacity}, y ${last.y.toFixed(1)}`,
      );
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
