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

/** Say a call `delayMs` after the boing (the boing leads; the voice follows). */
export function speakCall(sound: SoundApi, letter: string, number: number, delayMs = 120): void {
  sound.clip(callClip(letter, number), { delayMs, gain: 1 });
}

/** Stop talking (a claim, a phase change). */
export function hushCaller(sound: SoundApi): void {
  trace('hush', {});
  sound.hush();
}
