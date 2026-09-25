// ADR-054: the Spanish deck mirrors the English one — exactly one ES entry per English word (same
// difficulty), no duplicate Spanish words, every line and bot guess translated — and a Spanish
// game deals, judges and talks in Spanish while an English one is unchanged.
import { describe, expect, it } from 'vitest';
import { createRng, seedRng } from '@partybox/game-sdk';
import { FAMILY, FAMILY_ES, LINES, LINES_ES, SPICY, SPICY_ES, dealOffers } from '../server/content';
import { game } from '../server/index';
import { sampleInput } from '../server/bot';

const players = [1, 2, 3, 4].map((i) => ({
  id: `p${i}`,
  name: `P${i}`,
  avatarId: 'fox',
  connected: true,
}));

describe('Spanish pack (ADR-054)', () => {
  for (const [name, en, es] of [
    ['words', FAMILY, FAMILY_ES],
    ['words-spicy', SPICY, SPICY_ES],
  ] as const) {
    it(`${name}.es has exactly one entry per English word`, () => {
      expect(es.pack).toBe(en.pack);
      expect(es.words.map((w) => w.en)).toEqual(en.words.map((w) => w.text));
      es.words.forEach((w, i) => expect(w.difficulty).toBe(en.words[i]?.difficulty));
      const lower = es.words.map((w) => w.text.toLowerCase());
      expect(new Set(lower).size).toBe(lower.length);
    });
  }

  it('lines.es mirrors lines.json item for item, no duplicates', () => {
    for (const k of ['intact', 'broken', 'botGuesses'] as const) {
      expect(LINES_ES[k]).toHaveLength(LINES[k].length);
      expect(new Set(LINES_ES[k]).size).toBe(LINES_ES[k].length);
    }
  });

  it('a Spanish game deals Spanish words; an English one is unchanged', () => {
    const esWords = new Set([...FAMILY_ES.words, ...SPICY_ES.words].map((w) => w.text));
    const enWords = new Set([...FAMILY.words, ...SPICY.words].map((w) => w.text));
    const ctx = { players, settings: {}, seed: 7, now: 0 };
    const es = game.init({ ...ctx, contentLang: 'es' });
    const en = game.init(ctx);
    expect(es.contentLang).toBe('es');
    expect(en.contentLang).toBeUndefined();
    for (const offer of Object.values(es.offers))
      for (const w of offer) expect(esWords).toContain(w);
    for (const offer of Object.values(en.offers))
      for (const w of offer) expect(enWords).toContain(w);
    const [same] = dealOffers(seedRng(1), ['a'], false);
    expect(enWords).toContain(same['a']?.[0]);
  });

  it('a Spanish bot picks Spanish custom words', () => {
    const es = game.init({ players, settings: {}, seed: 7, now: 0, contentLang: 'es' });
    for (let i = 0; i < 40; i++) {
      const input = sampleInput(es, 'p1', createRng(i));
      if (input?.type === 'pickCustom')
        expect([
          'un robot confundido',
          'mi zapato izquierdo',
          'un gato muy cansado',
          'sopa',
          'la luna',
        ]).toContain(input.text);
    }
  });
});
