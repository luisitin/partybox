// The caller is one voice: a new call cuts the last one off before it speaks (loop 333).
import { describe, expect, it } from 'vitest';
import type { SoundApi } from '@partybox/game-sdk/ui';
import { callClip, clipLeadS, clipSeconds, speakCall } from '../client/caller';
import { BALL_LAND_MS } from '../client/caller';
import { READERS } from '../server/types';

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
    expect(log).toEqual(['hush', `clip:${callClip('B', 12)}@0+${clipLeadS('B', 12)}`]);
  });

  it("skips each clip's own silence (Zira's B has the longest lead, I the shortest)", () => {
    expect(clipLeadS('B', 12)).toBeGreaterThan(clipLeadS('G', 50));
    expect(clipLeadS('G', 50)).toBeGreaterThan(clipLeadS('N', 40));
    expect(clipLeadS('I', 20)).toBeLessThan(clipLeadS('O', 70));
    expect(clipLeadS('?', 0)).toBe(0.084);
  });

  // READER-VOICES
  it("speaks in the room's reader, and says nothing for 'No reader'", () => {
    expect(callClip('B', 12, 'sky')).toBe('/sfx/calls/sky/b12.wav');
    expect(callClip('B', 12, 'original')).toBe('/sfx/calls/b12.wav');
    expect(callClip('B', 12, 'none')).toBeNull();
    const { api, log } = fakeSound();
    speakCall(api, 'O', 75, 'none');
    expect(log).toEqual(['hush']);
  });

  it('the room waits for the reader: every clip of every voice ends before the fastest next call', () => {
    // The fastest caller is 3 s; the clip starts on the push, and a beat must follow it.
    const BEAT_S = 0.5;
    for (const reader of READERS.filter((r) => r !== 'none')) {
      for (const letter of ['B', 'I', 'N', 'G', 'O']) {
        const base = 'BINGO'.indexOf(letter) * 15;
        for (let n = base + 1; n <= base + 15; n++) {
          const said = clipSeconds(letter, n, reader) - clipLeadS(letter, n, reader);
          expect(said, `${reader} ${letter}${n}`).toBeGreaterThan(0.5);
          expect(said + BEAT_S + BALL_LAND_MS / 1000, `${reader} ${letter}${n}`).toBeLessThan(3);
        }
      }
    }
  });

  it('two calls in a row: the second hushes the first before it speaks — never two voices', () => {
    const { api, log } = fakeSound();
    speakCall(api, 'B', 12);
    speakCall(api, 'N', 45);
    expect(log.filter((l) => l === 'hush')).toHaveLength(2);
    expect(log.indexOf('hush', 1)).toBeLessThan(log.findIndex((l) => l.includes('n45')));
  });
});
