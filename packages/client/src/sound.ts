// Web Audio sound cues, synthesized (ADR-012: no audio files). Cue names are the design-system
// vocabulary (docs/DESIGN_SYSTEM.md; the type lives in the SDK so games can cue through
// `useSound`). `enable()` must be called from a user gesture (autoplay policy).
import { trace } from '@partybox/game-sdk/ui';
import type { SoundCue } from '@partybox/game-sdk/ui';
import { CUES } from './sound-cues';

export type { SoundCue };

const MUTE_KEY = 'partybox:muted';
export const PHONE_MUTE_KEY = 'partybox:phone-sound';

/**
 * A recorded clip inside a cue (the one exception to "no audio files", owner pick 2026-09-16: a
 * real "hooray"). Files live in packages/client/public/sfx (Mixkit licence, credited in the
 * README); decoded once per engine and played through the same graph as the notes.
 */
interface Sample {
  src: string;
  at: number;
  gain: number;
  /** Fade to silence from `fadeAt` over `fadeMs` (the crowd tails off under the next screen). */
  fadeAt?: number;
  fadeMs?: number;
  /** Start this far into the buffer (a recording's leading silence skipped) — seconds. */
  offset?: number;
}

const SAMPLES: Partial<Record<SoundCue, Sample[]>> = {
  // The winner moment: the horn leads, the crowd (10 s) comes in under it and tails off.
  cheer: [
    { src: '/sfx/party-horn.mp3', at: 0, gain: 0.9 },
    { src: '/sfx/crowd-cheer.mp3', at: 0.15, gain: 0.7, fadeAt: 6.5, fadeMs: 3000 },
  ],
};
/** The phone remembers its own mute (default on) separately from the TV's. */

/** 5 s → 880 Hz, 4 → 988, 3 → 1109, 2 → 1175, 1 → 1319: A major up to the fifth. */
export const COUNTDOWN_STEPS = [7, 5, 4, 2, 0] as const;
export function countdownSemitones(secondsLeft: number): number {
  return COUNTDOWN_STEPS[secondsLeft - 1] ?? 0;
}

/** Successive joins step up a scale and wrap (16 identical blips felt like a fault). */
export const JOIN_STEPS = [0, 2, 4, 5, 7] as const;
export function joinSemitones(playerCount: number): number {
  return JOIN_STEPS[Math.max(0, playerCount - 1) % JOIN_STEPS.length] ?? 0;
}

export interface PlayOptions {
  /** Transpose every note of the cue (12 = one octave up). */
  semitones?: number;
  /** Do not touch `lastPlayedAt`: a quiet cue must never suppress the shell's phase chime. */
  quiet?: boolean;
  /** Scale every note and sample of the cue (0..1, default 1): a pluck in the background of a
   *  moment, not on top of it (I-024: books passing hands). */
  gain?: number;
}

/** One lock-in = one soft tick, each higher than the last (whole tones, capped at the 5th). */
export function lockSemitones(lockedCount: number): number {
  return Math.min(Math.max(lockedCount - 1, 0), 4) * 2;
}

export interface SoundEngine {
  /** Create/resume the AudioContext. Call from a click/tap handler. */
  enable(): Promise<boolean>;
  enabled(): boolean;
  play(cue: SoundCue, opts?: PlayOptions): void;
  /** performance.now() of the last cue actually started — lets the shell skip a generic cue
   *  when the game just played a specific one in the same commit. */
  lastPlayedAt(): number;
  /** A recorded clip under /sfx (a bingo call): decoded once, scheduled exactly, mute-aware. */
  clip(src: string, opts?: { gain?: number; delayMs?: number; offsetS?: number }): void;
  /** Stop every clip now (a claim interrupts the caller). */
  hushClips(): void;
  muted(): boolean;
  setMuted(muted: boolean): void;
}

export interface SoundEngineOptions {
  /** Overall level (0–1) applied to every cue: the phone sits at 0.35 so it never competes
   *  with the TV. Omitted = unity (the TV and /preview). */
  master?: number;
  /** localStorage key for the persisted mute; the TV and the phone remember theirs separately. */
  muteKey?: string;
  /** Called when a cue actually starts (not muted): the TV ducks its music bed under it. */
  onPlay?: (cue: SoundCue) => void;
}

export function createSoundEngine(options: SoundEngineOptions = {}): SoundEngine {
  const muteKey = options.muteKey ?? MUTE_KEY;
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let muted = false;
  let lastPlayedAt = -Infinity;
  let lastCue: { cue: SoundCue; at: number } | null = null;
  let lastClip: { src: string; at: number } | null = null;
  const buffers = new Map<string, Promise<AudioBuffer | null>>();
  const buffer = (src: string): Promise<AudioBuffer | null> => {
    let pending = buffers.get(src);
    if (!pending) {
      pending = fetch(src)
        .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(res.statusText))))
        .then((bytes) => (ctx ? ctx.decodeAudioData(bytes) : null))
        .catch(() => null); // a missing clip is a silent cue, never an error
      buffers.set(src, pending);
    }
    return pending;
  };
  const clips = new Set<AudioBufferSourceNode>();
  // A hush also cancels clips still decoding (a first-time call fetched after the hush), so a
  // caller hushed mid-fetch never speaks late (loop 333).
  let hushGen = 0;
  const playSample = (sample: Sample, t0: number, track = false): void => {
    const gen = hushGen;
    void buffer(sample.src).then((buf) => {
      if (!buf || !ctx || muted || ctx.state !== 'running') return;
      if (track && gen !== hushGen) return;
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buf;
      if (track) {
        clips.add(source);
        source.addEventListener('ended', () => clips.delete(source));
      }
      const start = Math.max(ctx.currentTime, t0 + sample.at);
      gain.gain.setValueAtTime(sample.gain, start);
      if (sample.fadeAt !== undefined) {
        gain.gain.setValueAtTime(sample.gain, start + sample.fadeAt);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + sample.fadeAt + (sample.fadeMs ?? 2000) / 1000,
        );
      }
      source.connect(gain).connect(master ?? ctx.destination);
      source.start(start, sample.offset ?? 0);
    });
  };
  try {
    muted = localStorage.getItem(muteKey) === '1';
  } catch {
    /* ignore */
  }

  const engine: SoundEngine = {
    async enable() {
      try {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return false;
        ctx = ctx ?? new Ctor();
        if (options.master !== undefined && !master) {
          master = ctx.createGain();
          master.gain.value = options.master;
          master.connect(ctx.destination);
        }
        // Not only 'suspended': iOS Safari reports 'interrupted' after a lock or a background
        // tab, which a phone does far more often than a TV.
        if (ctx.state !== 'running') await ctx.resume();
        // Decode the clips now so the first cheer is instant.
        for (const samples of Object.values(SAMPLES)) for (const s of samples) void buffer(s.src);
        return ctx.state === 'running';
      } catch {
        return false;
      }
    },
    enabled: () => ctx?.state === 'running',
    play(cue, opts) {
      // The same cue twice inside 40 ms is one cue (a dev-mode double effect, an echoing push).
      const now = performance.now();
      if (lastCue && lastCue.cue === cue && now - lastCue.at < 40) return;
      lastCue = { cue, at: now };
      if (!opts?.quiet) lastPlayedAt = now;
      trace('cue', {
        cue,
        surface: options.master === undefined ? 'tv' : 'phone',
        muted,
        ready: ctx?.state === 'running',
        semitones: opts?.semitones ?? 0,
        gain: opts?.gain ?? 1,
      });
      if (!ctx || muted || ctx.state !== 'running') return;
      options.onPlay?.(cue);
      const t0 = ctx.currentTime;
      const scale = Math.min(1, Math.max(0, opts?.gain ?? 1));
      for (const sample of SAMPLES[cue] ?? [])
        playSample({ ...sample, gain: sample.gain * scale }, t0);
      const k = 2 ** ((opts?.semitones ?? 0) / 12);
      for (const note of CUES[cue]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = note.type ?? 'sine';
        osc.frequency.setValueAtTime(note.freq * k, t0 + note.at);
        if (note.to)
          osc.frequency.exponentialRampToValueAtTime(note.to * k, t0 + note.at + note.dur);
        const level = (note.gain ?? 0.18) * scale;
        gain.gain.setValueAtTime(0.0001, t0 + note.at);
        gain.gain.exponentialRampToValueAtTime(level, t0 + note.at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.at + note.dur);
        osc.connect(gain).connect(master ?? ctx.destination);
        osc.start(t0 + note.at);
        osc.stop(t0 + note.at + note.dur + 0.02);
      }
    },
    lastPlayedAt: () => lastPlayedAt,
    clip(src, opts) {
      const now = performance.now();
      if (lastClip && lastClip.src === src && now - lastClip.at < 40) return;
      lastClip = { src, at: now };
      // A clip is the game cueing the moment itself: the shell's phase chime yields to it as it
      // does to a cue (the first number of a Bingo round used to get a chime under its voice —
      // loop 332).
      lastPlayedAt = now;
      const name = src.split('/').pop() ?? src;
      // The trace records when the sound STARTS (its scheduled delay), not when it was asked for.
      const at = opts?.delayMs ?? 0;
      trace('clip', { src: name, muted, ready: ctx?.state === 'running', delayMs: at });
      // The audio trace reads calls as `speak` events (what the caller used to emit).
      if (name.match(/^[bingo]\d+\.wav$/))
        trace('speak', { text: name, voice: 'clip', delayMs: at });
      if (!ctx || muted || ctx.state !== 'running') return;
      playSample(
        {
          src,
          at: (opts?.delayMs ?? 0) / 1000,
          gain: opts?.gain ?? 1,
          offset: opts?.offsetS,
        },
        ctx.currentTime,
        true,
      );
    },
    hushClips() {
      hushGen += 1;
      for (const s of clips) {
        try {
          s.stop();
        } catch {
          /* already ended */
        }
      }
      clips.clear();
    },
    muted: () => muted,
    setMuted(value) {
      muted = value;
      try {
        localStorage.setItem(muteKey, value ? '1' : '0');
      } catch {
        /* ignore */
      }
    },
  };
  return engine;
}
