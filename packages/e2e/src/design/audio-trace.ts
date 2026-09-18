// Audio interaction trace: drives the real app through every screen — lobby, selecting, each
// game's phases, lock-ins, the last five seconds, pause / resume, results, play again, end, Home —
// with the TV and the phones instrumented (`window.__pbTrace`, see game-sdk/ui/trace.ts), then
// checks how every sound behaves at every transition: which cues fire where, that music follows
// the room and never doubles, that the caller only speaks in play, that phones only play their
// own cues. Writes AUDIO-TRACE.md + audio-trace.json.
// Usage: tsx packages/e2e/src/design/audio-trace.ts --out reports/design/<stamp> [--port 42071]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { runCoreScenarios } from './audio-scenarios-core';
import { runGameScenarios } from './audio-scenarios-games';
import { runHomeScenarios } from './audio-scenarios-home';
import { runMoreScenarios } from './audio-scenarios-more';
import { Tracer, openPhoneTraced, openTvTraced } from './audio-tracer';
import type { Pages } from './audio-tracer';
import { REPO_ROOT, startServer } from './server';
import { DevApi } from './session';

const { values } = parseArgs({
  options: { out: { type: 'string' }, port: { type: 'string', default: '42071' } },
});
const OUT = values.out ?? join(REPO_ROOT, 'reports', 'design', 'audio');
const PORT = Number(values.port);

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const server = await startServer(PORT);
  const api = new DevApi(server.url);
  const browser = await chromium.launch();
  const pages: Pages = { browser, url: server.url, contexts: [] };
  try {
    await api.reset();
    const tv = await openTvTraced(pages);
    const vip = await openPhoneTraced(pages, 'iphone', 'Sam');
    const p2 = await openPhoneTraced(pages, 'pixel', 'Priya');
    const T = new Tracer(tv, [vip, p2], api);
    T.lines.push(
      '# Audio interaction trace',
      '',
      `Captured ${new Date().toISOString()} on port ${PORT}. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.`,
    );
    const ctx = { T, tv, vip, p2, api, pages, out: OUT };
    // A scenario that throws still leaves its trace and checks behind (plus a still of each page).
    for (const run of [runCoreScenarios, runGameScenarios, runHomeScenarios, runMoreScenarios]) {
      try {
        await run(ctx);
      } catch (err) {
        T.ok(run.name, 'scenario completed without throwing', false, String(err).slice(0, 160));
        await tv.screenshot({ path: join(OUT, `${run.name}-failed-tv.png`) });
        await vip.page.screenshot({ path: join(OUT, `${run.name}-failed-vip.png`) });
        await p2.page.screenshot({ path: join(OUT, `${run.name}-failed-p2.png`) });
      }
    }
    const failed = T.checks.filter((c) => !c.pass);
    T.lines.splice(
      3,
      0,
      '',
      `**${T.checks.length - failed.length} / ${T.checks.length} checks passed.**${failed.length ? ' Failed: ' + failed.map((f) => `${f.scenario}: ${f.check}`).join('; ') : ''}`,
    );
    writeFileSync(join(OUT, 'AUDIO-TRACE.md'), `${T.lines.join('\n')}\n`);
    writeFileSync(
      join(OUT, 'audio-trace.json'),
      `${JSON.stringify({ checks: T.checks, tv: await T.trace(tv), vip: await T.trace(vip.page), p2: await T.trace(p2.page) }, null, 2)}\n`,
    );
    console.log(
      `${T.checks.length - failed.length}/${T.checks.length} checks passed → ${OUT}/AUDIO-TRACE.md`,
    );
    for (const f of failed) console.log(`  ✗ ${f.scenario} · ${f.check} — ${f.detail}`);
  } finally {
    await browser.close();
    await server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
