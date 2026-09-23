// READER-VOICES (ADR-045): what Blanks' voice says, when it asks for it, and the room waiting for it.
import { describe, expect, it } from 'vitest';
import lexicon from '../content/pronounce.json' with { type: 'json' };
import { blackCard, whiteText } from '../server/content';
import { reduce } from '../server/flow';
import { VOICE_BEAT_MS, VOICE_WAIT_MS } from '../server/phases/reveal';
import { readerFor, voiced } from '../server/round';
import { lexiconParts, readingFor, readingParts, speech } from '../server/speech';
import { playAll, start, toAnswer } from './helpers';

const said = (parts: ReturnType<typeof readingParts>): string =>
  parts.map((p) => ('ipa' in p ? `/${p.ipa}/` : p.text)).join('');

describe('what the reader says', () => {
  it('reads the finished card with a pause before the answer', () => {
    const text = said(readingParts('cb1', ['cw867'], 'george'));
    expect(text.startsWith('Nothing gets me out of bed like ')).toBe(true);
    expect(text).toContain('...');
    expect(text.indexOf('...')).toBeLessThan(text.indexOf('Pro Shops'));
  });

  it('says "blank" for a blank when the black card is read on its own', () => {
    expect(said(readingParts('cb1', [], 'sky'))).toBe('Nothing gets me out of bed like blank.');
  });

  it("applies the lexicon: a card's own fix, a name's phonemes, an acronym, a year", () => {
    // cw867 "Bass Pro Shops": the fish, for that card only
    expect(
      lexiconParts('Getting escorted out of a Bass Pro Shops.', 'cw867', 'george'),
    ).toContainEqual({ ipa: lexicon.cards.cw867.Bass.ipa, text: 'Bass' });
    expect(said(lexiconParts("Harambe's memorial.", 'mw1562', 'george'))).toContain(
      `/${lexicon.words.Harambe?.ipa}/'s`,
    );
    expect(said(lexiconParts('Hiding in Argentina since 1945.', 'ww2552', 'george'))).toContain(
      '19 45',
    );
    expect(said(lexiconParts('A CPAP.', null, 'george'))).not.toContain('CPAP');
  });

  it('every per-card fix names a card that exists', () => {
    for (const id of Object.keys(lexicon.cards)) {
      const text = id.includes('b') && !id.includes('w') ? blackCard(id).text : whiteText(id);
      expect(text, id).toBeTruthy();
    }
  });
});

describe('the room waits for the reader', () => {
  const george = (): ReturnType<typeof start> => start({ reader: 'george' } as never);

  it('asks for the question and every played card, once each', () => {
    let s = toAnswer(george());
    expect(speech(s)).toHaveLength(1); // the question alone
    s = playAll(s);
    const wanted = speech(s);
    expect(wanted.length).toBeGreaterThan(1);
    const first = wanted[0]!;
    s = reduce(s, { type: 'speech', now: s.phase.startedAt + 10, key: first.key, ms: 2400 });
    expect(speech(s).map((r) => r.key)).not.toContain(first.key);
    expect(readerFor(s, s.round)).toBeNull(); // the voice replaces the human reader
  });

  it('falls back to a person reading when the host has no voice (a reading answers -1)', () => {
    let s = playAll(toAnswer(george()));
    const first = speech(s)[0]!;
    s = reduce(s, { type: 'speech', now: s.phase.startedAt + 10, key: first.key, ms: -1 });
    expect(voiced(s)).toBe(false);
    if (s.settings.judge !== 'czar') expect(readerFor(s, s.round)).not.toBeNull();
  });

  it('holds each card for its reading and a beat, re-timing when the reading arrives', () => {
    let s = playAll(toAnswer(george()));
    // every answer is ready but the first card's; the reading starts
    for (const r of speech(s).slice(1))
      s = reduce(s, { type: 'speech', now: s.phase.startedAt, key: r.key, ms: 3000 });
    while (s.phase.id !== 'reveal')
      s = reduce(s, {
        type: 'timer',
        now: s.phase.deadline ?? s.phase.startedAt,
        phaseId: s.phase.id,
        startedAt: s.phase.startedAt,
      });
    const card = readingFor(s, s.revealIndex)!;
    const known = s.speech?.[card.key];
    const t0 = s.phase.startedAt;
    if (known === undefined) {
      expect(s.phase.deadline).toBe(t0 + VOICE_WAIT_MS);
      s = reduce(s, { type: 'speech', now: t0 + 2000, key: card.key, ms: 2500 });
      expect(s.phase.deadline).toBe(t0 + 2000 + 2500 + VOICE_BEAT_MS);
    } else {
      expect(s.phase.deadline).toBe(t0 + known + VOICE_BEAT_MS);
    }
  });
});
