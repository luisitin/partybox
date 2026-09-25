// ADR-054: the Spanish calls mirror the English ones — one ES call per English call (same numbers),
// each saying its own number, every line unique across both packs — and a Spanish game shows
// Spanish calls with no reader (the clips are English), while an English game is unchanged.
import { describe, expect, it } from 'vitest';
import { FAMILY, FAMILY_ES, SPICY, SPICY_ES, callFor } from '../server/content';
import { game } from '../server/index';

const players = [1, 2, 3].map((i) => ({
  id: `p${i}`,
  name: `P${i}`,
  avatarId: 'fox',
  connected: true,
}));

describe('Spanish calls (ADR-054)', () => {
  for (const [name, en, es] of [
    ['calls', FAMILY, FAMILY_ES],
    ['calls-spicy', SPICY, SPICY_ES],
  ] as const) {
    it(`${name}.es has exactly one call per English call`, () => {
      expect(es.pack).toBe(en.pack);
      expect(es.calls.map((c) => c.number)).toEqual(en.calls.map((c) => c.number));
    });
  }

  it('every Spanish line is unique, its punchline too, at most 6 words after the number', () => {
    const all = [...FAMILY_ES.calls, ...SPICY_ES.calls];
    const lines = all.map((c) => c.call.toLowerCase());
    expect(new Set(lines).size).toBe(lines.length);
    const tails = all.map((c) => c.call.split(',').slice(1).join(',').trim());
    for (const t of tails) expect(t.split(/\s+/).length).toBeLessThanOrEqual(6);
    const endings = tails.map((t) =>
      t
        .toLowerCase()
        .replace(/[¡!¿?'—]/g, '')
        .trim()
        .split(/\s+/)
        .at(-1),
    );
    const dup = endings.filter((e, i) => endings.indexOf(e) !== i);
    expect(dup).toEqual([]);
  });

  it('callFor picks the pack by language; English is unchanged', () => {
    expect(callFor(38, false)).toBe(FAMILY.calls.find((c) => c.number === 38)?.call);
    expect(callFor(38, false, 'es')).toMatch(/^El treinta y ocho, /);
    expect(callFor(74, true, 'es')).toBe(SPICY_ES.calls.find((c) => c.number === 74)?.call);
    expect(callFor(1, true, 'es')).toBe(FAMILY_ES.calls[0]?.call);
  });

  it('a Spanish game reads in a Spanish voice, never an English one; English keeps its voice', () => {
    const ctx = { players, settings: { reader: 'george' }, seed: 5, now: 0 };
    const es = game.init({ ...ctx, contentLang: 'es' });
    const en = game.init(ctx);
    expect(es.contentLang).toBe('es');
    expect((game.tvView(es) as { reader: string }).reader).toBe('dora');
    const santa = game.init({ ...ctx, settings: { reader: 'santa' }, contentLang: 'es' });
    expect((game.tvView(santa) as { reader: string }).reader).toBe('santa');
    expect((game.tvView(en) as { reader: string }).reader).toBe('george');
  });
});
