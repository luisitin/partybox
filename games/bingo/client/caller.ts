// The caller: every one of the 75 calls is a recorded clip (Windows "Zira", lively — rate +15 %,
// pitch +10 % — saying "B, 12", the owner's pick), bundled under /sfx/calls and played through the
// shell's audio graph (`useSoundApi().clip`): mute-aware, scheduled to the millisecond, the same
// voice on every TV browser, and nothing can ever be queued or replayed — the reason speech
// synthesis is gone (Chrome's speech queue replayed old calls in the lobby and mid-round).
import { trace } from '@partybox/game-sdk/ui';
import type { SoundApi } from '@partybox/game-sdk/ui';
import voices from './call-voices.json';

/** READER-VOICES (the owner, 2026-09-22): four Kokoro voices recorded the same 75 calls
 *  (/sfx/calls/<voice>/b12.wav); "original" is the shipped Zira set (/sfx/calls/b12.wav); "none"
 *  says nothing (the boing still sounds). `call-voices.json` holds each clip's first-syllable
 *  offset (5 % of peak, 5 ms early so the attack is kept — per clip: the Kokoro leads vary from
 *  25 to 200 ms) and its length (the rule "the room waits for the reader": calls-shown.test). */
type Clips = Readonly<Record<string, Readonly<Record<string, readonly [number, number]>>>>;
const CLIPS = voices as unknown as Clips;

/** The clip for a call in the room's voice, or null for "No reader". */
export function callClip(
  letter: string,
  number: number,
  reader: string = 'original',
): string | null {
  if (reader === 'none') return null;
  const name = `${letter.toLowerCase()}${number}`;
  return reader === 'original' || !CLIPS[reader]
    ? `/sfx/calls/${name}.wav`
    : `/sfx/calls/${reader}/${name}.wav`;
}

/** The ball's drop lands (the squash) this long after the push: the boing waits for it. */
export const BALL_LAND_MS = 190;

/** Where the first syllable starts in a clip (the caller skips the silence before it). */
export function clipLeadS(letter: string, number: number, reader: string = 'original'): number {
  const set = CLIPS[reader === 'none' ? 'original' : reader] ?? CLIPS['original'];
  return set?.[`${letter.toLowerCase()}${number}`]?.[0] ?? 0.084;
}

/** A clip's length in seconds (0 for no reader). */
export function clipSeconds(letter: string, number: number, reader: string): number {
  if (reader === 'none') return 0;
  const set = CLIPS[reader] ?? CLIPS['original'];
  return set?.[`${letter.toLowerCase()}${number}`]?.[1] ?? 0;
}

/**
 * Say a call so the voice starts AS the ball appears (the owner, 2026-09-18, twice: a listener
 * must be as fast as a watcher, and the voice was "still a little after the ball"). Scheduled on
 * the push with no delay: the first syllable is on the frame the ball enters; the boing waits
 * for the squash (BALL_LAND_MS). Before loop 335 the voice waited for the squash too.
 */
export function speakCall(
  sound: SoundApi,
  letter: string,
  number: number,
  reader: string = 'original',
  delayMs = 0,
): void {
  // Never two voices: a call that comes while the last one is still being said (a VIP pressing
  // Skip twice, a 3 s caller) cuts it off first (loop 333).
  hushCaller(sound);
  const clip = callClip(letter, number, reader);
  if (clip) sound.clip(clip, { delayMs, gain: 1, offsetS: clipLeadS(letter, number, reader) });
}

/** Stop talking (a claim, a phase change). */
export function hushCaller(sound: SoundApi): void {
  trace('hush', {});
  sound.hush();
}
