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
 * I-129 A: when each recorded call's voice has ended, in ms after the clip is scheduled — the file's
 * last sample above 5 % of its peak, less the letter's skipped lead (capture/measure_calls.py over
 * the 75 clips, 2026-09-22: 678–1327 ms). Re-measure if the calls are ever re-recorded.
 */
export const CALL_VOICE_MS: Readonly<Record<number, number>> = {
  1: 706, 2: 678, 3: 776, 4: 771, 5: 786, 6: 926, 7: 845, 8: 690, 9: 768, 10: 759, 11: 822,
  12: 833, 13: 964, 14: 1035, 15: 928, 16: 976, 17: 1126, 18: 893, 19: 1017, 20: 856, 21: 1047,
  22: 1024, 23: 1098, 24: 1116, 25: 1070, 26: 1234, 27: 1150, 28: 1022, 29: 1098, 30: 790,
  31: 1102, 32: 1087, 33: 1165, 34: 1182, 35: 1142, 36: 1301, 37: 1220, 38: 1093, 39: 1158,
  40: 923, 41: 1143, 42: 1118, 43: 1200, 44: 1202, 45: 1237, 46: 1327, 47: 1255, 48: 1124,
  49: 1193, 50: 936, 51: 1133, 52: 1117, 53: 1180, 54: 1202, 55: 1221, 56: 1316, 57: 1230,
  58: 1115, 59: 1184, 60: 996, 61: 1132, 62: 1107, 63: 1192, 64: 1195, 65: 1154, 66: 1313,
  67: 1242, 68: 1102, 69: 1178, 70: 947, 71: 1167, 72: 1140, 73: 1214, 74: 1230, 75: 1179,
};

/** I-129 A: the breath between the number and its nickname. */
export const NICK_GAP_MS = 260;

/**
 * I-129 A: the nickname's clip — /sfx/nicks/<number>.wav. A number the pack
 * has not recorded says nothing, so a half-finished pack sounds exactly like today.
 */
export function nickClip(number: number): string {
  return `/sfx/nicks/${number}.wav`;
}


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
export function speakCall(
  sound: SoundApi,
  letter: string,
  number: number,
  delayMs = 0,
  /** I-129 A: say the nickname once the number has been said. */
  nick?: { },
): void {
  // Never two voices: a call that comes while the last one is still being said (a VIP pressing
  // Skip twice, a 3 s caller) cuts it off first (loop 333).
  hushCaller(sound);
  sound.clip(callClip(letter, number), { delayMs, gain: 1, offsetS: clipLeadS(letter) });
  // I-129 A: then the joke, once the number is out (a missing clip is silence, never an error).
  if (nick)
    sound.clip(nickClip(number), {
      delayMs: delayMs + (CALL_VOICE_MS[number] ?? 1400) + NICK_GAP_MS,
      gain: 1,
    });
}

/** Stop talking (a claim, a phase change). */
export function hushCaller(sound: SoundApi): void {
  trace('hush', {});
  sound.hush();
}
