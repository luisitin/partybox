// Background music on the TV (owner request 2026-09-15; the tracks are Kevin MacLeod, CC BY 4.0,
// fetched by scripts/fetch-music.ts into /music/<id>.mp3 — never bundled, never on phones).
// A plan says which tracks, how loud, and how they follow each other:
//   rotate — play 30–60 s of a track, fade out, a second of silence, start another (the lobby);
//   chain  — whole tracks back to back with no gap, weighted pick (Bingo, Broken Pencil).
// One <audio> element, JS fades, level via `volume`; the TV's mute toggle mutes it too. `play()`
// needs a user gesture on the page (the TV's audio gate); until then it retries on `enable()`.
import type { TRACK_IDS } from './music-tracks';

export type TrackId = (typeof TRACK_IDS)[number];

export interface MusicPlan {
  id: string;
  tracks: readonly TrackId[];
  /** Pick weights, same order as `tracks` (chain mode); equal when absent. */
  weights?: readonly number[];
  /** Steady level 0..1. */
  volume: number;
  mode: 'rotate' | 'chain';
  /** rotate: how long a track plays before fading, [min, max] ms. */
  segmentMs?: readonly [number, number];
  /** rotate: silence between tracks. */
  gapMs?: number;
  fadeMs?: number;
}

export interface MusicEngine {
  /** Switch to a plan (fades the old one out); null = stop. The same plan id is a no-op. */
  play(plan: MusicPlan | null): void;
  /** Call after a user gesture: starts a plan that could not autoplay. */
  enable(): void;
  setMuted(muted: boolean): void;
  current(): string | null;
}

export const LOBBY_MUSIC: MusicPlan = {
  id: 'lobby',
  tracks: ['airport-lounge', 'bossa-antigua', 'local-forecast-elevator', 'george-street-shuffle'],
  volume: 0.35,
  mode: 'rotate',
  segmentMs: [30_000, 60_000],
  gapMs: 1000,
  fadeMs: 2500,
};

function pick(plan: MusicPlan, avoid: TrackId | null): TrackId {
  const candidates = plan.tracks.length > 1 ? plan.tracks.filter((t) => t !== avoid) : plan.tracks;
  const weights = candidates.map((t) => plan.weights?.[plan.tracks.indexOf(t)] ?? 1);
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < candidates.length; i += 1) {
    r -= weights[i] ?? 1;
    if (r <= 0) return candidates[i] as TrackId;
  }
  return candidates[candidates.length - 1] as TrackId;
}

export function createMusicEngine(): MusicEngine {
  let plan: MusicPlan | null = null;
  let audio: HTMLAudioElement | null = null;
  let last: TrackId | null = null;
  let muted = false;
  let unlocked = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  // One ramp per element: an outgoing track keeps fading while the next one fades in.
  const fades = new Map<HTMLAudioElement, ReturnType<typeof setInterval>>();
  let generation = 0;

  const clearTimer = (): void => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const clearFade = (el: HTMLAudioElement): void => {
    const handle = fades.get(el);
    if (handle) clearInterval(handle);
    fades.delete(el);
  };

  /** Ramp `el.volume` to `to` over `ms`, then `done`. */
  const rampTo = (el: HTMLAudioElement, to: number, ms: number, done?: () => void): void => {
    clearFade(el);
    const from = el.volume;
    const steps = Math.max(1, Math.round(ms / 50));
    let i = 0;
    const handle = setInterval(() => {
      i += 1;
      el.volume = Math.max(0, Math.min(1, from + ((to - from) * i) / steps));
      if (i >= steps) {
        clearFade(el);
        done?.();
      }
    }, 50);
    fades.set(el, handle);
  };

  const stopElement = (el: HTMLAudioElement): void => {
    clearFade(el);
    el.pause();
    el.src = '';
  };

  const start = (p: MusicPlan, gen: number): void => {
    if (gen !== generation) return;
    const id = pick(p, last);
    last = id;
    const el = new Audio(`/music/${id}.mp3`);
    el.preload = 'auto';
    el.muted = muted;
    el.volume = p.mode === 'rotate' ? 0 : p.volume;
    audio = el;
    el.addEventListener('ended', () => {
      if (gen !== generation || audio !== el) return;
      // chain: straight into the next one; rotate: the segment timer usually wins, but a short
      // track can end first — treat it like a segment end without the fade.
      if (p.mode === 'chain') start(p, gen);
      else timer = setTimeout(() => start(p, gen), p.gapMs ?? 1000);
    });
    el.addEventListener('error', () => {
      // A missing file (fetch-music never ran) must not loop forever: try the next track once,
      // then give up quietly.
      if (gen !== generation || audio !== el) return;
      if (p.tracks.length > 1 && !el.dataset['retried']) {
        el.dataset['retried'] = '1';
        timer = setTimeout(() => start(p, gen), 500);
      }
    });
    void el
      .play()
      .then(() => {
        unlocked = true;
        if (p.mode === 'rotate') {
          rampTo(el, p.volume, Math.min(p.fadeMs ?? 2500, 1500));
          const [lo, hi] = p.segmentMs ?? [30_000, 60_000];
          timer = setTimeout(
            () => {
              if (gen !== generation || audio !== el) return;
              rampTo(el, 0, p.fadeMs ?? 2500, () => {
                stopElement(el);
                timer = setTimeout(() => start(p, gen), p.gapMs ?? 1000);
              });
            },
            lo + Math.random() * (hi - lo),
          );
        }
      })
      .catch(() => {
        // No user activation yet: keep the plan, `enable()` retries.
        stopElement(el);
        if (audio === el) audio = null;
      });
  };

  const stop = (fadeMs: number): void => {
    clearTimer();
    generation += 1;
    const el = audio;
    audio = null;
    if (!el) return;
    if (fadeMs > 0 && !el.paused) rampTo(el, 0, fadeMs, () => stopElement(el));
    else stopElement(el);
  };

  return {
    play(next) {
      if ((next?.id ?? null) === (plan?.id ?? null)) return;
      stop(next ? 800 : 1500);
      plan = next;
      if (plan) start(plan, generation);
    },
    enable() {
      if (plan && !audio && !unlocked) start(plan, generation);
    },
    setMuted(value) {
      muted = value;
      if (audio) audio.muted = value;
    },
    current: () => (audio ? (last ?? null) : null),
  };
}
