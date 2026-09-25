// ADR-054: the Spanish packs mirror the English ones — exactly one ES prompt per English prompt id,
// the "___" blanks kept, no duplicate prompts or bot answers — and a Spanish game deals Spanish
// prompts and bot answers while an English one is unchanged.
import { describe, expect, it } from 'vitest';
import { createRng } from '@partybox/game-sdk';
import { FAMILY, FAMILY_ES, SPICY, SPICY_ES } from '../server/content';
import { game } from '../server/index';
import { PLAYERS, T0, timer } from './helpers';

const blanks = (t: string): number => (t.match(/___/g) ?? []).length;

describe('Spanish packs (ADR-054)', () => {
  for (const [name, en, es] of [
    ['family', FAMILY, FAMILY_ES],
    ['spicy', SPICY, SPICY_ES],
  ] as const) {
    it(`${name}.es has exactly one entry per English prompt, blanks kept, no duplicates`, () => {
      expect(es.prompts.map((p) => p.id)).toEqual(en.prompts.map((p) => p.id));
      es.prompts.forEach((p, i) => expect(blanks(p.text), p.id).toBe(blanks(en.prompts[i]!.text)));
      const texts = es.prompts.map((p) => p.text.toLowerCase());
      expect(new Set(texts).size).toBe(texts.length);
    });
  }

  it('bot answers: one per English answer, no duplicates', () => {
    expect(FAMILY_ES.botAnswers).toHaveLength(FAMILY.botAnswers.length);
    expect(new Set(FAMILY_ES.botAnswers).size).toBe(FAMILY_ES.botAnswers.length);
  });

  it('a Spanish game deals Spanish prompts and bot answers; English is unchanged', () => {
    const ctx = { players: PLAYERS, settings: { spicy: true }, seed: 3, now: T0 };
    const esTexts = new Set([...FAMILY_ES.prompts, ...SPICY_ES.prompts].map((p) => p.text));
    const enTexts = new Set([...FAMILY.prompts, ...SPICY.prompts].map((p) => p.text));
    const es = timer(game.init({ ...ctx, contentLang: 'es' }));
    const en = timer(game.init(ctx));
    expect(es.contentLang).toBe('es');
    expect(en.contentLang).toBeUndefined();
    for (const p of es.prompts) expect(esTexts).toContain(p.text);
    for (const p of en.prompts) expect(enTexts).toContain(p.text);
    const input = game.bot.sampleInput(es, PLAYERS[0]!.id, createRng(1));
    expect(input?.type).toBe('answer');
    if (input?.type === 'answer') expect(FAMILY_ES.botAnswers).toContain(input.text);
  });
});
