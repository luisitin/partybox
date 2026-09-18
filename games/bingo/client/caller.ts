// The caller: every one of the 75 calls is a recorded clip (Windows "Zira", lively — rate +15 %,
// pitch +10 % — saying "B, 12", the owner's pick), bundled under /sfx/calls and played through the
// shell's audio graph (`useSoundApi().clip`): mute-aware, scheduled to the millisecond, the same
// voice on every TV browser, and nothing can ever be queued or replayed — the reason speech
// synthesis is gone (Chrome's speech queue replayed old calls in the lobby and mid-round).
import { trace } from '@partybox/game-sdk/ui';
import type { SoundApi } from '@partybox/game-sdk/ui';

/** The clip for a call: /sfx/calls/b12.wav. */
export function callClip(letter: string, number: number): string {
  return `/sfx/calls/${letter.toLowerCase()}${number}.wav`;
}

/** The ball's drop lands (the squash) this long after the push: the boing waits for it. */
export const BALL_LAND_MS = 190;

/**
 * Every recorded call opens with ~90–140 ms of silence (measured across the 75 clips, loop 310);
 * the caller skips it, so the first syllable starts where the clip is scheduled.
 */
export const CLIP_LEAD_S = 0.09;

/**
 * Say a call so the voice starts AS the ball lands (the owner, 2026-09-18: a listener must be as
 * fast as a watcher). Scheduled on the push, `delayMs` = BALL_LAND_MS by default: the boing and
 * the first syllable share the squash frame; before, the voice trailed the number by ~450 ms
 * (190 to the boing, 120 after it, 140 of silence in the clip).
 */
export function speakCall(
  sound: SoundApi,
  letter: string,
  number: number,
  delayMs = BALL_LAND_MS,
): void {
  sound.clip(callClip(letter, number), { delayMs, gain: 1, offsetS: CLIP_LEAD_S });
}

/** Stop talking (a claim, a phase change). */
export function hushCaller(sound: SoundApi): void {
  trace('hush', {});
  sound.hush();
}
