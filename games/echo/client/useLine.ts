// The reader (ADR-045): play one line the host made, on its beat — `delayMs` after `since` (the
// moment the stage began, server time). A line still being made when its beat comes plays the moment it
// arrives, unless it is more than LATE_READING_MS late (then the text alone carries it: a voice
// out of step with the cards is worse than none). Mute-aware through the shell's clip graph.
import { useEffect, useRef } from 'react';
import { useServerOffset, useSoundApi } from '@partybox/game-sdk/ui';
import type { Say } from '../server/speech';
import { LATE_READING_MS } from './timing';

export function speechUrl(key: string): string {
  return `/api/speech/${key}.wav`;
}

export function useLine(line: Say | undefined, delayMs: number, since: number, on = true): void {
  const sound = useSoundApi();
  const offset = useServerOffset();
  const said = useRef(new Set<string>());
  const key = on && line ? line.key : null;
  const ready = line?.ms !== null && line?.ms !== undefined && line.ms >= 0;
  useEffect(() => {
    if (!key || !ready || said.current.has(key)) return;
    const wait = since + delayMs - (Date.now() + offset);
    if (wait < -LATE_READING_MS) {
      said.current.add(key);
      return;
    }
    said.current.add(key);
    sound.clip(speechUrl(key), { gain: 1, duck: false, delayMs: Math.max(0, wait) });
  }, [key, ready, delayMs, since, sound, offset]);
}

/** Two lines back to back: the second starts after the first's length and a breath. */
export function sequenceDelays(lines: readonly Say[], firstAt: number, gap: number): number[] {
  const out: number[] = [];
  let at = firstAt;
  for (const l of lines) {
    out.push(at);
    at += Math.max(0, l.ms ?? 900) + gap;
  }
  return out;
}
