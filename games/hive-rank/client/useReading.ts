// READER-VOICES (ADR-045): play the room's reading once, the moment it is up — the question at
// `rank`, "The hive has decided", each spot as it lands, "Queen bee!". The host made it
// (`view.speech`); the server's pacing already waits for it and a beat. Mute-aware like every clip.
// `cue` plays with it on the same frame (a spot's `card` pluck lands with its voice).
import { useEffect, useRef } from 'react';
import { useSoundApi } from '@partybox/game-sdk/ui';
import type { SoundCue } from '@partybox/game-sdk/ui';
import { DECIDED_BEAT_MS, RANK_BEAT_MS, SCORE_BEAT_MS } from './timing';

export function useReading(
  speech: { key: string; url: string } | null,
  on = true,
  delayMs = 0,
): void {
  const sound = useSoundApi();
  const said = useRef(new Set<string>());
  const key = on ? (speech?.key ?? null) : null;
  const url = speech?.url ?? null;
  useEffect(() => {
    if (!key || !url || said.current.has(key)) return;
    const play = (): void => {
      said.current.add(key);
      sound.hush(); // never two readings at once
      sound.clip(url, { gain: 1, duck: false });
    };
    if (delayMs <= 0) {
      play();
      return;
    }
    // A reading that opens a phase waits a beat, so the phase's own chime rings first (the
    // shell keeps its chime off a game's voice) — and the server's pacing counts the beat.
    const h = setTimeout(play, delayMs);
    return () => clearTimeout(h);
  }, [key, url, sound, delayMs]);
}

/** How long a reading waits into its moment (TV and phone-only phones alike). */
export function readingDelay(phaseId: string, step: number): number {
  if (phaseId === 'rank') return RANK_BEAT_MS;
  if (phaseId === 'hive' && step === 0) return DECIDED_BEAT_MS;
  if (phaseId === 'score') return SCORE_BEAT_MS;
  return 0;
}

/** Plays `cue` once each time `key` changes to a new non-null value (a spot landing). */
export function useCueOn(key: string | null, cue: SoundCue | null, gain = 1): void {
  const sound = useSoundApi();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (key === null || key === last.current || !cue) return;
    last.current = key;
    sound.play(cue, { gain, quiet: true });
  }, [key, cue, gain, sound]);
}
