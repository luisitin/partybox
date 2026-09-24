// Dead air and hard cuts in a recorded surface (the owner, 2026-09-24: "no choppiness / deadness —
// well oiled, smooth"). Plays a capture's .webm in headless Chromium, samples it at --fps on a
// 128-pixel-wide grey canvas, and reports:
//   · dead spans — the picture holds still (mean frame difference under --still) for --min-ms or
//     more, with the phase / mark it fell in and whether any sound cue played inside it;
//   · hard cuts — one sample to the next changes more than --cut of the picture: a screen that
//     jumped instead of moving (a transition should spread that change over several frames).
// A countdown ticking or an idle shimmer counts as motion, so a span it reports really is frozen.
// No ffmpeg (Playwright's bundled one cannot write raw frames) and no new dependency.
//
// Usage:
//   pnpm exec tsx packages/e2e/src/design/dead-air.ts --video <tv.webm> [--fps 10] [--min-ms 1500]
//     [--still 0.0025] [--moved-max 0] [--cut 0.22] [--rate 4] [--marks marks.json --surface tv] [--timeline timeline.json]
//     [--cues cues.json] [--out dead-air.json]
//   --marks: an ideas capture's marks.json (t0 per surface + named moments) labels each span with
//   the last mark before it; --timeline: capture-loop's timeline.json (changes[].videoS + phase).
//   --cues: capture-loop's cues.json ({ t, surface, cue }[] in epoch ms; needs --marks' t0 or the
//   timeline's tvVideoT0 to line up).
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

const { values } = parseArgs({
  options: {
    video: { type: 'string' },
    fps: { type: 'string', default: '10' },
    'min-ms': { type: 'string', default: '1500' },
    still: { type: 'string', default: '0.0025' },
    cut: { type: 'string', default: '0.22' },
    rate: { type: 'string', default: '4' },
    'moved-max': { type: 'string', default: '0' },
    marks: { type: 'string' },
    surface: { type: 'string', default: 'tv' },
    timeline: { type: 'string' },
    cues: { type: 'string' },
    out: { type: 'string' },
  },
});
if (!values.video) throw new Error('--video is required');
const VIDEO = resolve(values.video);
const FPS = Number(values.fps);
const MIN_MS = Number(values['min-ms']);
const STILL = Number(values.still);
const CUT = Number(values.cut);
const RATE = Number(values.rate);
const MOVED_MAX = Number(values['moved-max']);

interface Label {
  s: number;
  name: string;
}
/** Named moments along the video's own clock (seconds), sorted. */
function labels(): { list: Label[]; t0: number | null } {
  if (values.marks) {
    const m = JSON.parse(readFileSync(resolve(values.marks), 'utf8')) as {
      t0: Record<string, number>;
      marks: { name: string; surface: string; at: number }[];
    };
    const t0 = m.t0[values.surface] ?? null;
    if (t0 === null) return { list: [], t0 };
    const list = m.marks
      .filter((k) => k.surface === values.surface || values.surface === 'tv')
      .map((k) => ({ s: (k.at - t0) / 1000, name: k.name }));
    return { list: list.sort((a, b) => a.s - b.s), t0 };
  }
  if (values.timeline) {
    const t = JSON.parse(readFileSync(resolve(values.timeline), 'utf8')) as {
      changes?: { videoS?: number; phoneVideoS?: number | null; phase: string }[];
    };
    const key = values.surface === 'tv' ? 'videoS' : 'phoneVideoS';
    const list = (t.changes ?? [])
      .filter((c) => typeof c[key] === 'number')
      .map((c) => ({ s: c[key] as number, name: c.phase }));
    return { list, t0: null };
  }
  return { list: [], t0: null };
}

/** Sound cues along the video's clock (seconds), when they can be lined up. */
function cues(t0: number | null): number[] {
  if (!values.cues || t0 === null) return [];
  const all = JSON.parse(readFileSync(resolve(values.cues), 'utf8')) as {
    t: number;
    surface?: string;
  }[];
  return all
    .filter((c) => !c.surface || c.surface === (values.surface === 'tv' ? 'tv' : 'phone'))
    .map((c) => (c.t - t0) / 1000);
}

/** How much the picture moves, sample to sample: p50 / p90 / p99 / max of the mean difference. */
function percentiles(xs: number[]): Record<string, number> {
  const s = [...xs].sort((a, b) => a - b);
  const q = (p: number): number =>
    +(s[Math.min(s.length - 1, Math.floor(s.length * p))] ?? 0).toFixed(4);
  return { p50: q(0.5), p90: q(0.9), p99: q(0.99), max: q(1) };
}

// In-page sampler: plays the video through (seeking a screencast webm lands on stale frames — it
// has almost no keyframes) at --rate, and diffs a small grey copy of each decoded frame, bucketed
// to --fps on the video's own clock (requestVideoFrameCallback's mediaTime).
const SAMPLER = `async ({ fps, rate }) => {
  const v = document.querySelector('video');
  await new Promise((ok, fail) => { if (v.readyState >= 1) ok(); else { v.onloadedmetadata = ok; v.onerror = fail; } });
  const w = 128, h = Math.max(1, Math.round((128 * v.videoHeight) / v.videoWidth));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  let prev = null; let nextT = 0; const diffs = []; const moved = []; let last = 0;
  const grab = () => {
    g.drawImage(v, 0, 0, w, h);
    const px = g.getImageData(0, 0, w, h).data;
    const grey = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) grey[i] = (px[i * 4] * 0.3 + px[i * 4 + 1] * 0.59 + px[i * 4 + 2] * 0.11) / 255;
    if (prev) { let s = 0, n = 0; for (let i = 0; i < grey.length; i++) { const d = Math.abs(grey[i] - prev[i]); s += d; if (d > 0.04) n++; } diffs.push(s / grey.length); moved.push(n); }
    prev = grey;
  };
  v.playbackRate = rate;
  await new Promise((done) => {
    const onFrame = (_now, meta) => {
      last = meta.mediaTime;
      // one sample per 1/fps of video time; a skipped bucket repeats the difference as 0 motion
      while (meta.mediaTime >= nextT) { grab(); nextT += 1 / fps; }
      if (!v.ended) v.requestVideoFrameCallback(onFrame);
    };
    v.requestVideoFrameCallback(onFrame);
    v.onended = () => done();
    void v.play();
  });
  return { dur: isFinite(v.duration) ? v.duration : last, diffs, moved };
}`;

async function main(): Promise<void> {
  const size = statSync(VIDEO).size;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    // The video is served through a route so the page needs no file:// access.
    await page.route('**/capture.webm', (route) =>
      route.fulfill({ status: 200, contentType: 'video/webm', body: readFileSync(VIDEO) }),
    );
    await page.route('**/index.html', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<video src="/capture.webm" muted preload="auto"></video>',
      }),
    );
    await page.goto('http://dead-air.local/index.html');
    const { dur, diffs, moved } = (await page.evaluate(
      `(${SAMPLER})({ fps: ${FPS}, rate: ${RATE} })`,
    )) as { dur: number; diffs: number[]; moved: number[] };
    const { list, t0 } = labels();
    const cueS = cues(t0);
    const at = (s: number): string => {
      let name = '(start)';
      for (const l of list) if (l.s <= s) name = l.name;
      return name;
    };
    const step = 1 / FPS;
    const dead: { fromS: number; toS: number; ms: number; during: string; cueInside: boolean }[] =
      [];
    let run = -1;
    const close = (end: number): void => {
      if (run < 0) return;
      const fromS = run * step;
      const toS = end * step;
      const ms = Math.round((toS - fromS) * 1000);
      if (ms >= MIN_MS)
        dead.push({
          fromS: +fromS.toFixed(1),
          toS: +toS.toFixed(1),
          ms,
          during: at(fromS),
          cueInside: cueS.some((c) => c >= fromS && c <= toS),
        });
      run = -1;
    };
    diffs.forEach((d, i) => {
      // still = no pixel of the 128-wide grey copy changed by more than 4 % (a ticking digit or a
      // shimmer moves a few) and the mean change stays under --still
      if (d < STILL && (moved[i] ?? 0) <= MOVED_MAX) {
        if (run < 0) run = i;
      } else close(i);
    });
    close(diffs.length);
    const cutsAt = diffs
      .map((d, i) => ({ s: +((i + 1) * step).toFixed(1), change: +d.toFixed(3) }))
      .filter((c) => c.change >= CUT)
      .map((c) => ({ ...c, during: at(c.s) }));
    const report = {
      video: VIDEO,
      bytes: size,
      durationS: +dur.toFixed(1),
      fps: FPS,
      thresholds: { stillMeanDiff: STILL, minDeadMs: MIN_MS, cutMeanDiff: CUT },
      deadSpans: dead,
      deadMsTotal: dead.reduce((n, d) => n + d.ms, 0),
      hardCuts: cutsAt,
      samples: diffs.length,
      motion: percentiles(diffs),
    };
    if (values.out) writeFileSync(resolve(values.out), JSON.stringify(report, null, 2) + '\n');
    console.log(
      `${dur.toFixed(1)} s · ${dead.length} dead span(s), ${report.deadMsTotal} ms still · ${cutsAt.length} hard cut(s)`,
    );
    for (const d of dead)
      console.log(
        `  still ${d.fromS}–${d.toS} s (${d.ms} ms) during ${d.during}${d.cueInside ? ' · a cue played' : ''}`,
      );
    for (const c of cutsAt) console.log(`  cut at ${c.s} s (${c.change}) during ${c.during}`);
  } finally {
    await browser.close();
  }
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
