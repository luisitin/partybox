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
 * Every recorded call opens with silence before the letter's first syllable — a fixed length per
 * letter (measured on the 75 clips at 5 % of peak, loop 335: B 137–140 ms, I 89–90, N 93–96,
 * G 112, O 92–93). The caller skips it, a few ms short so the attack is kept, and the first
 * syllable starts where the clip is scheduled. (Loop 310 skipped a flat 90 ms: B started 50 ms
 * late, G 20 ms late.)
 */
const CLIP_LEAD_S: Record<string, number> = { B: 0.132, I: 0.084, N: 0.088, G: 0.106, O: 0.087 };
export function clipLeadS(letter: string): number {
  return CLIP_LEAD_S[letter.toUpperCase()] ?? 0.084;
}

/**
 * Say a call so the voice starts AS the ball appears (the owner, 2026-09-18, twice: a listener
 * must be as fast as a watcher, and the voice was "still a little after the ball"). Scheduled on
 * the push with no delay: the first syllable is on the frame the ball enters; the boing waits
 * for the squash (BALL_LAND_MS). Before loop 335 the voice waited for the squash too.
 */
export function speakCall(sound: SoundApi, letter: string, number: number, delayMs = 0): void {
  // Never two voices: a call that comes while the last one is still being said (a VIP pressing
  // Skip twice, a 3 s caller) cuts it off first (loop 333).
  hushCaller(sound);
  sound.clip(callClip(letter, number), { delayMs, gain: 1, offsetS: clipLeadS(letter) });
}

/** Stop talking (a claim, a phase change). */
export function hushCaller(sound: SoundApi): void {
  trace('hush', {});
  sound.hush();
}
