// The caller is one voice: a new call cuts the last one off before it speaks (loop 333).
import { describe, expect, it } from 'vitest';
import type { SoundApi } from '@partybox/game-sdk/ui';
import { BALL_LAND_MS, CLIP_LEAD_S, callClip, speakCall } from '../client/caller';

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
  it("hushes the caller, then schedules the clip on the ball's landing with the lead-in skipped", () => {
    const { api, log } = fakeSound();
    speakCall(api, 'B', 12);
    expect(log).toEqual(['hush', `clip:${callClip('B', 12)}@${BALL_LAND_MS}+${CLIP_LEAD_S}`]);
  });

  it('two calls in a row: the second hushes the first before it speaks — never two voices', () => {
    const { api, log } = fakeSound();
    speakCall(api, 'B', 12);
    speakCall(api, 'N', 45);
    expect(log.filter((l) => l === 'hush')).toHaveLength(2);
    expect(log.indexOf('hush', 1)).toBeLessThan(log.findIndex((l) => l.includes('n45')));
  });
});
