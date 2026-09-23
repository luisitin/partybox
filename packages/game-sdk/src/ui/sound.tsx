// Sound cues are the design system's vocabulary (docs/DESIGN_SYSTEM.md). The client shell owns
// the Web Audio synth and provides `play` through this context, so a game's Tv component can cue
// its own moments — a new bingo call, a wrong-answer buzzer, a fanfare — without knowing about
// audio at all. Outside a provider (previews, tests) every cue is silent.
import { createContext, useContext, useMemo } from 'react';
import type { JSX, ReactNode } from 'react';

export const SOUND_CUES = [
  'ready',
  'start',
  'join',
  'phase',
  'countdown',
  'tick',
  'reveal',
  'card',
  'win',
  'pause',
  'leave',
  'fanfare',
  'cheer',
  'tie', // I-037 C: several winners — the win arpeggio landing on a held Csus4, crowd under it
  'silence',
  'jackpot',
  'bust',
  'sweep',
  'wager',
  'tally',
  'submit',
  'lock',
  'correct',
  'error',
  'wrong',
  'call',
  'daub',
  'claim',
  'dibs',
  'close',
] as const;

export type SoundCue = (typeof SOUND_CUES)[number];

export function isSoundCue(value: string): value is SoundCue {
  return (SOUND_CUES as readonly string[]).includes(value);
}

/** What a game may ask of a cue: `quiet` keeps it from standing in for the shell's phase chime
 *  (a background tick, not the moment); `gain` scales it (0..1) — a pluck under a hand-off, not
 *  on top of it (I-024). The shell may ignore either. */
export interface PlayCueOptions {
  quiet?: boolean;
  gain?: number;
}
export type PlayCue = (cue: SoundCue, opts?: PlayCueOptions) => void;

export interface ClipOptions {
  /** Start this far into the clip (skip a recording's leading silence) — seconds. */
  offsetS?: number;
  /** 0..1, default 1. */
  gain?: number;
  /** Start this many ms after the call (a cue may lead). */
  delayMs?: number;
  /** false: the music stays where it is under this clip (Blanks' readings — the owner,
   *  2026-09-23: quiet music the whole time, not a dip and a swell around every card). */
  duck?: boolean;
}

/**
 * What a game's Tv gets from the shell: `play` a design-system cue; `clip` a recorded file under
 * /sfx (a bingo call), through the same graph — mute, master level; `hush` stops every clip.
 */
export interface SoundApi {
  play: PlayCue;
  clip: (src: string, opts?: ClipOptions) => void;
  hush: () => void;
}

const SILENT: SoundApi = { play: () => undefined, clip: () => undefined, hush: () => undefined };
const SoundContext = createContext<SoundApi>(SILENT);

export function SoundProvider({
  play,
  clip,
  hush,
  children,
}: {
  play: PlayCue;
  clip?: SoundApi['clip'];
  hush?: SoundApi['hush'];
  children: ReactNode;
}): JSX.Element {
  // One stable object per set of functions: consumers key effects on it (a new object every
  // render would replay a game's "new call" effect on every push).
  const value = useMemo<SoundApi>(
    () => ({ play, clip: clip ?? SILENT.clip, hush: hush ?? SILENT.hush }),
    [play, clip, hush],
  );
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

/** The shell's `play(cue)`; a no-op when no shell provides one. */
export function useSound(): PlayCue {
  return useContext(SoundContext).play;
}

/** The whole shell audio API (cues + recorded clips). */
export function useSoundApi(): SoundApi {
  return useContext(SoundContext);
}
