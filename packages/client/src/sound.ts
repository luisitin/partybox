// Web Audio sound cues, synthesized (ADR-012: no audio files). Cue names are the design-system
// vocabulary (docs/DESIGN_SYSTEM.md). `enable()` must be called from a user gesture (autoplay policy).
export type SoundCue = 'join' | 'phase' | 'countdown' | 'reveal' | 'win' | 'submit' | 'error';

const MUTE_KEY = 'partybox:muted';

interface Note {
  freq: number;
  at: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
}

const CUES: Record<SoundCue, Note[]> = {
  join: [
    { freq: 523, at: 0, dur: 0.08 },
    { freq: 659, at: 0.09, dur: 0.12 },
  ],
  phase: [
    { freq: 392, at: 0, dur: 0.1, type: 'triangle' },
    { freq: 523, at: 0.1, dur: 0.1, type: 'triangle' },
    { freq: 784, at: 0.2, dur: 0.18, type: 'triangle' },
  ],
  countdown: [{ freq: 880, at: 0, dur: 0.05, type: 'square', gain: 0.12 }],
  reveal: [
    { freq: 440, at: 0, dur: 0.12, type: 'sawtooth', gain: 0.1 },
    { freq: 554, at: 0.12, dur: 0.12, type: 'sawtooth', gain: 0.1 },
    { freq: 659, at: 0.24, dur: 0.3, type: 'sawtooth', gain: 0.1 },
  ],
  win: [
    { freq: 523, at: 0, dur: 0.12 },
    { freq: 659, at: 0.13, dur: 0.12 },
    { freq: 784, at: 0.26, dur: 0.12 },
    { freq: 1047, at: 0.4, dur: 0.45 },
  ],
  submit: [
    { freq: 660, at: 0, dur: 0.05 },
    { freq: 880, at: 0.05, dur: 0.07 },
  ],
  error: [{ freq: 150, at: 0, dur: 0.15, type: 'square', gain: 0.12 }],
};

export interface SoundEngine {
  /** Create/resume the AudioContext. Call from a click/tap handler. */
  enable(): Promise<boolean>;
  enabled(): boolean;
  play(cue: SoundCue): void;
  muted(): boolean;
  setMuted(muted: boolean): void;
}

export function createSoundEngine(): SoundEngine {
  let ctx: AudioContext | null = null;
  let muted = false;
  try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
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
        if (ctx.state === 'suspended') await ctx.resume();
        return ctx.state === 'running';
      } catch {
        return false;
      }
    },
    enabled: () => ctx?.state === 'running',
    play(cue) {
      if (!ctx || muted || ctx.state !== 'running') return;
      const t0 = ctx.currentTime;
      for (const note of CUES[cue]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = note.type ?? 'sine';
        osc.frequency.value = note.freq;
        const level = note.gain ?? 0.18;
        gain.gain.setValueAtTime(0.0001, t0 + note.at);
        gain.gain.exponentialRampToValueAtTime(level, t0 + note.at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.at + note.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + note.at);
        osc.stop(t0 + note.at + note.dur + 0.02);
      }
    },
    muted: () => muted,
    setMuted(value) {
      muted = value;
      try {
        localStorage.setItem(MUTE_KEY, value ? '1' : '0');
      } catch {
        /* ignore */
      }
    },
  };
  return engine;
}
