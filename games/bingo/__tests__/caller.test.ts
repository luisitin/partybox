// The caller is one voice: a new call cuts the last one off before it speaks (loop 333).
import { beforeAll, describe, expect, it } from 'vitest';
import type { SoundApi } from '@partybox/game-sdk/ui';
import { callClip, clipLeadS, clipSeconds, spanishClipsLoaded, speakCall } from '../client/caller';
import { BALL_LAND_MS } from '../client/caller';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import esVoices from '../client/call-voices.es.json';
import manifest from '../manifest.json';
import { readSettings } from '../server/index';
import { READERS, READERS_BY_LANG } from '../server/types';

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
  beforeAll(() => spanishClipsLoaded);

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

  // Owner 2026-09-25: the Spanish caller is Kokoro's es-419 voices, recorded like the English set.
  it('every Spanish clip is measured and on disk: 75 per voice, none empty', () => {
    const table = esVoices as unknown as Record<string, Record<string, [number, number]>>;
    const pub = resolve(__dirname, '../../../packages/client/public');
    for (const reader of ['dora', 'alex', 'santa']) {
      expect(Object.keys(table[reader] ?? {}), reader).toHaveLength(75);
      for (let n = 1; n <= 75; n++) {
        const letter = 'BINGO'[Math.floor((n - 1) / 15)] ?? 'B';
        const clip = callClip(letter, n, reader);
        expect(clip).toBe(`/sfx/calls/${reader}/${letter.toLowerCase()}${n}.wav`);
        const file = resolve(pub, `.${clip}`);
        expect(existsSync(file), file).toBe(true);
        expect(statSync(file).size, file).toBeGreaterThan(20_000);
        expect(clipSeconds(letter, n, reader)).toBe(
          table[reader]?.[`${letter.toLowerCase()}${n}`]?.[1],
        );
      }
    }
  });
});

describe('the reader by content language (ADR-054)', () => {
  const reader = manifest.settings.find((s) => s.key === 'reader') as unknown as {
    options: { value: string; lang?: string }[];
  };
  const offered = (lang: string): string[] =>
    reader.options.filter((o) => o.lang === undefined || o.lang === lang).map((o) => o.value);

  it('a Spanish game offers only the Spanish voices (and No reader); English is unchanged', () => {
    expect(offered('es')).toEqual(['none', 'dora', 'alex', 'santa']);
    expect(offered('en')).toEqual(['none', 'george', 'fable', 'jessica', 'sky', 'original']);
    expect(offered('es')).toEqual([...READERS_BY_LANG.es.readers]);
    expect(offered('en')).toEqual([...READERS_BY_LANG.en.readers]);
  });

  it('never an English voice in a Spanish game, nor a Spanish one in an English game', () => {
    expect(readSettings({}, 'es').reader).toBe('dora');
    expect(readSettings({ reader: 'sky' }, 'es').reader).toBe('dora');
    expect(readSettings({ reader: 'santa' }, 'es').reader).toBe('santa');
    expect(readSettings({ reader: 'none' }, 'es').reader).toBe('none');
    expect(readSettings({}).reader).toBe('sky');
    expect(readSettings({ reader: 'george' }, 'en').reader).toBe('george');
    expect(readSettings({ reader: 'dora' }, 'en').reader).toBe('sky');
  });
});
