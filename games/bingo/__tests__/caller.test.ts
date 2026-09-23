// The caller is one voice: a new call cuts the last one off before it speaks (loop 333).
import { describe, expect, it } from 'vitest';
import type { SoundApi } from '@partybox/game-sdk/ui';
import {
  CALL_VOICE_MS,
  NICK_GAP_MS,
  callClip,
  clipLeadS,
  nickClip,
  speakCall,
} from '../client/caller';
import { callPackFor } from '../server/content';

function fakeSound(): { api: SoundApi; log: string[] } {
  const log: string[] = [];
  const api: SoundApi = {
    play: (cue) => {
      log.push(`play:${cue}`);
    },
    clip: (src, opts) => {
      log.push(`clip:${src}@${opts?.delayMs ?? 0}+${opts?.offsetS ?? 0}`);
    },
    hush: () => {
      log.push('hush');
    },
  };
  return { api, log };
}

describe('speakCall', () => {
  it("hushes the caller, then starts the clip at once with the letter's lead-in skipped", () => {
    const { api, log } = fakeSound();
    speakCall(api, 'B', 12);
    expect(log).toEqual(['hush', `clip:${callClip('B', 12)}@0+${clipLeadS('B')}`]);
  });

  it("skips each letter's own silence (B has the longest, I the shortest)", () => {
    expect(clipLeadS('B')).toBeGreaterThan(clipLeadS('G'));
    expect(clipLeadS('G')).toBeGreaterThan(clipLeadS('N'));
    expect(clipLeadS('I')).toBeLessThan(clipLeadS('O'));
    expect(clipLeadS('?')).toBe(clipLeadS('I'));
  });

  it('two calls in a row: the second hushes the first before it speaks — never two voices', () => {
    const { api, log } = fakeSound();
    speakCall(api, 'B', 12);
    speakCall(api, 'N', 45);
    expect(log.filter((l) => l === 'hush')).toHaveLength(2);
    expect(log.indexOf('hush', 1)).toBeLessThan(log.findIndex((l) => l.includes('n45')));
  });
});

describe('I-129 the spoken nickname', () => {
  it('starts a breath after the number has been said — never over it', () => {
    const { api, log } = fakeSound();
    speakCall(api, 'O', 69, 0, { pack: 'family', });
    const at = CALL_VOICE_MS[69] as number;
    expect(at).toBeGreaterThan(1000); // the number's voice runs past a second
    expect(log[2]).toBe(`clip:${nickClip('family', 69)}@${at + NICK_GAP_MS}+0`);
  });

  it('knows where every one of the 75 calls ends', () => {
    for (let n = 1; n <= 75; n++) expect(CALL_VOICE_MS[n]).toBeGreaterThan(600);
  });

  it("a cheeky room uses the cheeky voice only for the cheeky pack's own lines", () => {
    const all = [...Array(75).keys()].map((i) => i + 1);
    const cheeky = all.filter((n) => callPackFor(n, true) === 'cheeky');
    expect(cheeky.length).toBeGreaterThan(0);
    expect(cheeky.length).toBeLessThan(75);
    for (const n of all) expect(callPackFor(n, false)).toBe('family');
  });
});
