// The narrator on the stage (ADR-045): play the view's reading once, the moment it is up. The
// server only puts a key in a view on the step that plays it and paces the step to the reading,
// so starting it on its frame keeps voice and picture together. Mute-aware like every clip.
// A phase's first reading waits a beat: the shell's phase cue ("pick up your phone", "look at the
// TV") plays on the phase change and yields to any clip in the same 50 ms, so a reading on the
// first frame would silence it (p01). Steps inside a phase have no shell cue and speak at once.
// Also the stage's own cues for reveal steps (the shell cues phase changes; steps are ours).
import { useEffect, useRef } from 'react';
import { useSoundApi } from '@partybox/game-sdk/ui';
import type { SoundCue } from '@partybox/game-sdk/ui';

/** Room for the shell's phase cue before the voice (the cues run 150–450 ms). */
export const AFTER_CUE_MS = 380;

export function useNarrator(say: { key: string; url: string } | null, on = true): void {
  const sound = useSoundApi();
  const said = useRef(new Set<string>());
  const mountedAt = useRef<number | null>(null);
  const key = on ? (say?.key ?? null) : null;
  const url = say?.url ?? null;
  useEffect(() => {
    mountedAt.current ??= performance.now();
  }, []);
  useEffect(() => {
    if (!key || !url || said.current.has(key)) return undefined;
    const since = performance.now() - (mountedAt.current ?? performance.now());
    const wait = Math.max(0, Math.round(AFTER_CUE_MS - since));
    // Marked said only when it speaks: a re-run that cancels the wait schedules it again.
    const speak = (): void => {
      if (said.current.has(key)) return;
      said.current.add(key);
      sound.hush(); // never two readings at once
      sound.clip(url, { gain: 1, duck: false });
    };
    // `clip()` marks the sound engine busy the moment it is called (even with `delayMs`), so the
    // call itself waits until the shell's phase cue has had its turn.
    if (wait === 0) {
      speak();
      return undefined;
    }
    const h = setTimeout(speak, wait);
    return () => clearTimeout(h);
  }, [key, url, sound]);
}

/** Plays `cue` once each time `beat` changes to a new non-null value. */
export function useStepCue(beat: string | null, cue: SoundCue | null, gain = 1): void {
  const sound = useSoundApi();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!beat || !cue || last.current === beat) return;
    last.current = beat;
    sound.play(cue, { gain, quiet: true });
  }, [beat, cue, gain, sound]);
}
