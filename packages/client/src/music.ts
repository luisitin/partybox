// Background music on the TV (owner request 2026-09-15; the tracks are Kevin MacLeod, CC BY 4.0,
// fetched by scripts/fetch-music.ts into /music/<id>.mp3 — never bundled, never on phones).
// A plan says which tracks, how loud, and how they follow each other:
//   rotate — play a few minutes of a track, fade out, a second of silence, start another (lobby);
//   chain  — whole tracks back to back with no gap, weighted pick (Bingo, Broken Pencil, Wisecrack).
// One <audio> element, JS fades, level via `volume`; the TV's mute toggle mutes it too. `play()`
// needs a user gesture on the page (the TV's audio gate); until then it retries on `enable()`.
import type { PushedView, RoomSnapshot, TvView } from '@partybox/shared';
import { trace } from '@partybox/game-sdk/ui';
import type { GameMusic } from '@partybox/game-sdk/ui';
import { TRACK_IDS } from './music-tracks';

export type TrackId = (typeof TRACK_IDS)[number];

export interface MusicPlan {
  id: string;
  tracks: readonly TrackId[];
  /** Pick weights, same order as `tracks` (chain mode); equal when absent. */
  weights?: readonly number[];
  /** Steady level 0..1. */
  volume: number;
  mode: 'rotate' | 'chain';
  /** rotate: how long a track plays before fading, [min, max] ms (default 30–60 s). */
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
  /** A paused game holds the music where it is. */
  setPaused(paused: boolean): void;
  /** Drop to a third of the level for `ms` (a cheer on top), then come back. */
  duck(ms: number): void;
  current(): string | null;
}

export const LOBBY_MUSIC: MusicPlan = {
  id: 'lobby',
  tracks: ['airport-lounge', 'bossa-antigua', 'local-forecast-elevator', 'george-street-shuffle'],
  volume: 0.35,
  mode: 'rotate',
  // A few minutes per track (owner: "go on longer before fading"), then a fade and a breath.
  segmentMs: [150_000, 240_000],
  gapMs: 1000,
  fadeMs: 2500,
};

const isTrackId = (id: string): id is TrackId => (TRACK_IDS as readonly string[]).includes(id);

/**
 * What the TV should play for this room state: the lobby set while people gather or pick a game,
 * the game's own `music` (limited to its `phases`) while playing, nothing on results.
 */
export function planFor(
  room: RoomSnapshot | null,
  view: PushedView<TvView> | null,
  gameMusic: GameMusic | undefined,
): MusicPlan | null {
  if (!room) return null;
  if (room.status === 'lobby' || room.status === 'selecting') return LOBBY_MUSIC;
  if (room.status !== 'playing' || !gameMusic || !room.selectedGameId) return null;
  if (gameMusic.phases && (!view || !gameMusic.phases.includes(view.phaseId))) return null;
  const tracks = gameMusic.tracks.filter(isTrackId);
  if (tracks.length === 0) return null;
  return {
    id: `game:${room.selectedGameId}`,
    tracks,
    weights: gameMusic.weights,
    volume: gameMusic.volume,
    mode: gameMusic.mode,
  };
}

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
  let paused = false;
  let unlocked = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  // One ramp per element: an outgoing track keeps fading while the next one fades in.
  const fades = new Map<HTMLAudioElement, ReturnType<typeof setInterval>>();
  // Every element that ever started; `stop()` retires them all, so a switch can never leave an
  // orphan playing underneath the next track.
  const live = new Set<HTMLAudioElement>();
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
    trace('music:stop', { track: (el.src || '').split('/').pop() ?? '' });
    clearFade(el);
    live.delete(el);
    // Retired first: clearing `src` fires `error` on the element, which must not read as a
    // missing file (that is what started a second track underneath the first).
    el.dataset['retired'] = '1';
    el.pause();
    el.removeAttribute('src');
    el.load();
  };
  const retired = (el: HTMLAudioElement): boolean => el.dataset['retired'] === '1';

  const start = (p: MusicPlan, gen: number): void => {
    if (gen !== generation) return;
    const id = pick(p, last);
    last = id;
    trace('music:start', { plan: p.id, track: id, mode: p.mode, volume: p.volume });
    const el = new Audio(`/music/${id}.mp3`);
    el.preload = 'auto';
    el.muted = muted;
    el.volume = p.mode === 'rotate' ? 0 : p.volume;
    audio = el;
    live.add(el);
    el.addEventListener('ended', () => {
      if (retired(el) || gen !== generation || audio !== el) return;
      // chain: straight into the next one; rotate: the segment timer usually wins, but a short
      // track can end first — treat it like a segment end without the fade.
      if (p.mode === 'chain') start(p, gen);
      else timer = setTimeout(() => start(p, gen), p.gapMs ?? 1000);
    });
    el.addEventListener('error', () => {
      // A missing file (fetch-music never ran) must not loop forever: try the next track once,
      // then give up quietly. A retired element's error is just its source being cleared.
      if (retired(el) || gen !== generation || audio !== el) return;
      stopElement(el);
      audio = null;
      if (p.tracks.length > 1 && !el.dataset['retried']) {
        el.dataset['retried'] = '1';
        timer = setTimeout(() => start(p, gen), 500);
      }
    });
    void el
      .play()
      .then(() => {
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
        // The browser refused (no activation after all): keep the plan for the next enable().
        stopElement(el);
        if (audio === el) audio = null;
        unlocked = false;
      });
  };

  const stop = (fadeMs: number): void => {
    clearTimer();
    generation += 1;
    audio = null;
    for (const el of [...live]) {
      if (fadeMs > 0 && !el.paused) rampTo(el, 0, fadeMs, () => stopElement(el));
      else stopElement(el);
    }
  };

  return {
    play(next) {
      if ((next?.id ?? null) === (plan?.id ?? null)) return;
      trace('music:plan', { from: plan?.id ?? null, to: next?.id ?? null });
      stop(next ? 800 : 1500);
      plan = next;
      // Nothing before the audio gate's first tap, even where the browser would allow it: the
      // gate is the one moment the room agrees to sound.
      if (plan && unlocked) start(plan, generation);
    },
    enable() {
      const first = !unlocked;
      unlocked = true;
      if (plan && !audio && first) start(plan, generation);
    },
    setMuted(value) {
      muted = value;
      if (audio) audio.muted = value;
    },
    duck(ms) {
      const el = audio;
      if (!el || !plan) return;
      trace('music:duck', { ms });
      const level = plan.volume;
      rampTo(el, level * 0.3, 400);
      setTimeout(() => {
        if (audio === el && !el.paused) rampTo(el, level, 1500);
      }, ms);
    },
    setPaused(value) {
      if (paused === value) return;
      paused = value;
      trace('music:paused', { paused: value });
      if (!audio) return;
      if (value) audio.pause();
      else void audio.play().catch(() => undefined);
    },
    current: () => (audio ? (last ?? null) : null),
  };
}
