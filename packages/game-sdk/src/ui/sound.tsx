// Sound cues are the design system's vocabulary (docs/DESIGN_SYSTEM.md). The client shell owns
// the Web Audio synth and provides `play` through this context, so a game's Tv component can cue
// its own moments — a new bingo call, a wrong-answer buzzer, a fanfare — without knowing about
// audio at all. Outside a provider (previews, tests) every cue is silent.
import { createContext, useContext } from 'react';
import type { JSX, ReactNode } from 'react';

export type SoundCue =
  | 'join'
  | 'phase'
  | 'countdown'
  | 'reveal'
  | 'win'
  | 'fanfare'
  | 'submit'
  | 'error'
  | 'wrong'
  | 'call'
  | 'daub';

export type PlayCue = (cue: SoundCue) => void;

const SoundContext = createContext<PlayCue>(() => undefined);

export function SoundProvider({
  play,
  children,
}: {
  play: PlayCue;
  children: ReactNode;
}): JSX.Element {
  return <SoundContext.Provider value={play}>{children}</SoundContext.Provider>;
}

/** The shell's `play(cue)`; a no-op when no shell provides one. */
export function useSound(): PlayCue {
  return useContext(SoundContext);
}
