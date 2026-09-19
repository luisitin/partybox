// Helpers for capture-loop.ts: cue-log grouping (oscillator starts → design-system cue names),
// browser hooks, and frame-strip extraction with Playwright's bundled ffmpeg (scale/trim only).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './server';

export const FFMPEG = join(
  process.env['LOCALAPPDATA'] ?? '',
  'ms-playwright',
  'ffmpeg-1011',
  process.platform === 'win32' ? 'ffmpeg-win64.exe' : 'ffmpeg-linux',
);

export interface CueEvent {
  t: number;
  surface: 'tv' | 'phone';
  freqs: number[];
  cue: string;
  phase: string;
}
export interface PhaseChange {
  t: number;
  status: string;
  phase: string;
  deadline: number | null;
  /** The music bed the TV reports under this phase (ADR-032), once it has settled. */
  bed?: string | null;
}

/** Cue signatures (first notes' frequencies) parsed from the client's sound table. */
export function cueSignatures(): { name: string; freqs: number[]; type: string }[] {
  // The table moved to sound-cues.ts (bingo loop #238); read whichever file holds it.
  const src = join(REPO_ROOT, 'packages', 'client', 'src');
  let text = readFileSync(join(src, 'sound-cues.ts'), 'utf8');
  if (!text.includes('const CUES')) text = readFileSync(join(src, 'sound.ts'), 'utf8');
  const block = text.slice(
    text.indexOf('const CUES'),
    text.indexOf('\n};', text.indexOf('const CUES')),
  );
  // Bracket-aware (loop 312): one-line entries (`tick: [{…}],`) and multi-line ones sit side by
  // side, and a lazy regex swallowed several cues into their neighbours — `call`, `dibs`, `claim`,
  // `reveal` and `tick` were never in the table, so every Bingo call was logged as `ready`.
  // The first note's waveform too (loop 373): `countdown` (880 triangle) and Bingo's `tick`
  // (880 square) share a frequency, and every 3 · 2 · 1 tick was logged as a countdown.
  const out: { name: string; freqs: number[]; type: string }[] = [];
  const re = /^\s{2}(\w+): \[/gm;
  for (let m = re.exec(block); m; m = re.exec(block)) {
    let depth = 0;
    let end = m.index + m[0].length - 1;
    for (; end < block.length; end += 1) {
      const ch = block[end];
      if (ch === '[') depth += 1;
      else if (ch === ']') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const body = block.slice(m.index + m[0].length, end);
    const freqs = [...body.matchAll(/freq: (\d+)/g)].map((x) => Number(x[1]));
    const type = /type: '(\w+)'/.exec(body)?.[1] ?? 'sine';
    out.push({ name: m[1] as string, freqs, type });
    re.lastIndex = end;
  }
  return out;
}

/** Browser-side hooks: log every oscillator start (cue log) and every long frame (perceived perf). */
export const HOOKS = `
  (() => {
    const log = []; const frames = []; const long = [];
    window.__pbCueLog = log; window.__pbFrames = frames; window.__pbLong = long;
    const proto = (window.AudioContext || window.webkitAudioContext)?.prototype;
    if (proto) {
      const orig = proto.createOscillator;
      proto.createOscillator = function () {
        const osc = orig.call(this);
        if (this.__pbBed) return osc; // a music bed's context: notes, not cues
        const set = osc.frequency.setValueAtTime.bind(osc.frequency);
        let freq = null;
        osc.frequency.setValueAtTime = (v, t) => { if (freq === null) freq = v; return set(v, t); };
        const start = osc.start.bind(osc);
        osc.start = (when) => { log.push({ t: Date.now(), freq, when: when - this.currentTime, type: osc.type }); return start(when); };
        return osc;
      };
    }
    let last = performance.now();
    const tick = (now) => { const d = now - last; last = now; if (d > 34) long.push({ t: Date.now(), ms: Math.round(d) }); frames.push(d); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  })();
`;

export function groupCues(
  raw: { t: number; freq: number | null; when: number; type?: string }[],
  surface: 'tv' | 'phone',
  phaseAt: (t: number) => string,
): CueEvent[] {
  const sigs = cueSignatures();
  const out: CueEvent[] = [];
  const sorted = [...raw].sort((a, b) => a.t - b.t);
  let group: typeof sorted = [];
  const flush = (): void => {
    if (group.length === 0) return;
    const freqs = group
      .filter((g) => g.freq !== null)
      .sort((a, b) => a.when - b.when)
      .map((g) => Math.round(g.freq as number));
    // Pitch-shifted cues (countdown, join) still match by ratio to the first note.
    const norm = (f: number[]): string =>
      f
        .slice(0, 4)
        .map((x) => (x / (f[0] ?? 1)).toFixed(2))
        .join(',');
    // An exact match first: `submit` and `tally` share a ratio, so the ratio pass alone named
    // every phone submit a tally (review-loop #115).
    // Among ratio matches, the one whose first note is nearest: `call` (392→784, 587) and
    // `ready` (523, 784) share 2:3 ratios, and every Bingo call read as "ready" (loop 312).
    const first = freqs[0] ?? 0;
    const nearest = (cands: typeof sigs): (typeof sigs)[number] | undefined =>
      [...cands].sort(
        (a, b) => Math.abs((a.freqs[0] ?? 0) - first) - Math.abs((b.freqs[0] ?? 0) - first),
      )[0];
    const type = [...group].sort((a, b) => a.when - b.when)[0]?.type ?? 'sine';
    const match =
      sigs.find((s) => s.freqs.join(',') === freqs.join(',') && s.type === type) ??
      sigs.find((s) => s.freqs.join(',') === freqs.join(',')) ??
      nearest(
        sigs.filter((s) => s.freqs.length === freqs.length && norm(s.freqs) === norm(freqs)),
      ) ??
      nearest(sigs.filter((s) => norm(s.freqs) === norm(freqs)));
    out.push({
      t: group[0]?.t ?? 0,
      surface,
      freqs,
      cue: match?.name ?? '?',
      phase: phaseAt(group[0]?.t ?? 0),
    });
    group = [];
  };
  for (const g of sorted) {
    if (group.length > 0 && g.t - (group[0]?.t ?? 0) > 40) flush();
    group.push(g);
  }
  flush();
  return out;
}

export function strip(
  video: string,
  dir: string,
  fromSec: number,
  seconds: number,
  fps = 10,
  /** An ffmpeg crop (`w:h:x:y`, source pixels) for a small region — a board cell, a button. */
  crop?: string,
): void {
  if (!existsSync(FFMPEG) || fromSec < 0) return;
  mkdirSync(dir, { recursive: true });
  spawnSync(FFMPEG, [
    '-loglevel',
    'error',
    '-y',
    '-ss',
    fromSec.toFixed(2),
    '-i',
    video,
    '-t',
    String(seconds),
    '-r',
    String(fps),
    '-vf',
    crop ? `crop=${crop},scale=640:-1` : 'scale=640:-1',
    join(dir, 'f%02d.png'),
  ]);
}
