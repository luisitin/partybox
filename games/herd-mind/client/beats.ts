// The stage's choreography clock: which beat of a phase we are on, counted from when the phase
// mounted and FROZEN while the room is paused (SPEC §2.16: a pause freezes the herd, resume
// continues it). It is sequencing, not decoration, so reduced motion still steps through the
// beats; only the movement between them is dropped (CSS). Readings play on beats too.
import { useEffect, useRef, useState } from 'react';
import { useSoundApi } from '@partybox/game-sdk/ui';
import type { Line, LineCue } from '../server/views';

/** The index of the last beat reached: `atMs` ascending, beat 0 at mount. */
export function useStageBeats(atMs: readonly number[], paused: boolean): number {
  const [beat, setBeat] = useState(() => lastReached(atMs, 0));
  const elapsed = useRef(0);
  const since = useRef<number | null>(null);
  const key = atMs.join(',');
  useEffect(() => {
    if (paused) return undefined;
    since.current = performance.now();
    const base = elapsed.current;
    const timers = atMs
      .map((at, i) => ({ at, i }))
      .filter(({ at }) => at > base)
      .map(({ at, i }) => window.setTimeout(() => setBeat((b) => Math.max(b, i)), at - base));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      if (since.current !== null) elapsed.current = base + (performance.now() - since.current);
      since.current = null;
    };
    // `key` stands for `atMs` (a new array every render).
  }, [key, paused]);
  return beat;
}

function lastReached(atMs: readonly number[], elapsed: number): number {
  let last = 0;
  atMs.forEach((at, i) => {
    if (at <= elapsed) last = i;
  });
  return last;
}

/** How late a line may still start after its beat: a question can land a moment late and still
 *  help; a verdict or a cheer line that misses its moment is dropped (the words are on screen). */
const LATE_MS: Partial<Record<LineCue, number>> = { question: 3_000 };
const LATE_DEFAULT_MS = 800;

/**
 * Plays each reading once when its beat comes: `at` maps a line's cue to its beat index. A line
 * that is not in the view (not made yet, or the reader is off) is not played — the text is on
 * screen either way — and one that turns up too long after its beat is dropped. `on` false (an
 * at-TV phone) plays nothing.
 */
export function useLines(
  lines: readonly Line[],
  at: Partial<Record<LineCue, number>>,
  beat: number,
  on = true,
): void {
  const sound = useSoundApi();
  const said = useRef(new Set<string>());
  // When each beat was reached (performance.now), to tell a late line from an on-time one.
  const reached = useRef<Map<number, number>>(new Map());
  useEffect(() => {
    if (!reached.current.has(beat)) reached.current.set(beat, performance.now());
  }, [beat]);
  useEffect(() => {
    if (!on) return;
    for (const line of lines) {
      const when = at[line.cue];
      if (when === undefined || beat < when || said.current.has(line.key)) continue;
      said.current.add(line.key);
      const since = performance.now() - (reached.current.get(when) ?? performance.now());
      if (since > (LATE_MS[line.cue] ?? LATE_DEFAULT_MS)) continue;
      sound.hush(); // never two readings at once
      sound.clip(line.url, { gain: 1, duck: false });
    }
  }, [lines, at, beat, on, sound]);
}
