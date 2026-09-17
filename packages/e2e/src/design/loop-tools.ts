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
export function cueSignatures(): { name: string; freqs: number[] }[] {
  const text = readFileSync(join(REPO_ROOT, 'packages', 'client', 'src', 'sound.ts'), 'utf8');
  const block = text.slice(
    text.indexOf('const CUES'),
    text.indexOf('\n};', text.indexOf('const CUES')),
  );
  const out: { name: string; freqs: number[] }[] = [];
  for (const m of block.matchAll(/^\s{2}(\w+): \[([\s\S]*?)^\s{2}\],?$/gm)) {
    const freqs = [...(m[2] ?? '').matchAll(/freq: (\d+)/g)].map((x) => Number(x[1]));
    out.push({ name: m[1] as string, freqs });
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
        osc.start = (when) => { log.push({ t: Date.now(), freq, when: when - this.currentTime }); return start(when); };
        return osc;
      };
    }
    let last = performance.now();
    const tick = (now) => { const d = now - last; last = now; if (d > 34) long.push({ t: Date.now(), ms: Math.round(d) }); frames.push(d); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  })();
`;

export function groupCues(
  raw: { t: number; freq: number | null; when: number }[],
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
    const match =
      sigs.find((s) => s.freqs.length === freqs.length && norm(s.freqs) === norm(freqs)) ??
      sigs.find((s) => norm(s.freqs) === norm(freqs));
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

export function strip(video: string, dir: string, fromSec: number, seconds: number): void {
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
    '10',
    '-vf',
    'scale=640:-1',
    join(dir, 'f%02d.png'),
  ]);
}
