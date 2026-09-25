// The packs (SPEC §1.14): 14 family and 6 spicy categories of 12 words, every rule in packRules,
// stable unique ids, and no accepted form shared between two words anywhere.
import { describe, expect, it } from 'vitest';
import { normalize } from '../match';
import { FAMILY, PRONUNCIATIONS, SPICY } from '../server/content';
import { checkCategory } from './packRules';
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };

describe('packs', () => {
  it('14 family categories and 6 spicy ones, 12 words each', () => {
    expect(FAMILY.categories.map((c) => c.label)).toEqual([
      'Food',
      'Drinks',
      'Animals',
      'Around the house',
      'Places',
      'Jobs',
      'Sports',
      'Vehicles',
      'Nature and weather',
      'Clothes',
      'Holidays and parties',
      'Music',
      'Fantasy',
      'Tech',
    ]);
    expect(SPICY.categories.map((c) => c.label)).toEqual([
      'Dating',
      'Night out',
      'Guilty pleasures',
      'Awkward moments',
      'Party fouls',
      'Bad habits',
    ]);
  });

  for (const cat of [...FAMILY.categories, ...SPICY.categories]) {
    it(`${cat.category}: every pack rule holds`, () => {
      const r = checkCategory(cat);
      expect(r.errors).toEqual([]);
      expect(r.warnings).toEqual([]);
    });
  }

  it('ids are unique and no accepted form belongs to two words', () => {
    const ids = new Set<string>();
    const forms = new Map<string, string>();
    for (const cat of [...FAMILY.categories, ...SPICY.categories])
      for (const w of cat.words) {
        expect(ids.has(w.id)).toBe(false);
        ids.add(w.id);
        for (const f of [w.answer, ...w.accept]) {
          const k = normalize(f).compact;
          expect(forms.get(k) ?? w.id, `${f}`).toBe(w.id);
          forms.set(k, w.id);
        }
      }
    expect(ids.size).toBe(240);
  });

  it('pronunciations parse and each has a respelling', () => {
    expect(PRONUNCIATIONS).toBeTruthy();
    for (const [word, entry] of Object.entries(pronunciationsJson.words)) {
      expect(word).toMatch(/^[a-z-]+$/);
      expect(entry.say.length).toBeGreaterThan(0);
    }
  });
});
