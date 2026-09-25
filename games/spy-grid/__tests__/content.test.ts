// Content rules (SPEC §9.20): sizes, every word in 2+ themes, clues legal against their own
// members, hints legal against their word, no duplicates after normalizing, boards without clashes.
import { describe, expect, it } from 'vitest';
import { seedRng } from '@partybox/game-sdk';
import { clashes, dealKey, drawBoard } from '../server/board';
import {
  FAMILY_THEMES,
  FAMILY_WORDS,
  SPICY_THEMES,
  SPICY_WORDS,
  wordEntry,
} from '../server/content';
import { isLegalClue, normalize } from '@partybox/game-sdk/match';
import type { Theme, Word } from '../content/schema';

const ALL = [...FAMILY_WORDS, ...SPICY_WORDS];
const opts = { lang: 'en' as const, oneWord: true };

function memberships(words: readonly Word[], themes: readonly Theme[]): Map<string, string[]> {
  const out = new Map<string, string[]>(words.map((w) => [w.id, []]));
  for (const t of themes) for (const m of t.members) out.get(m)?.push(t.id);
  return out;
}

describe('pack sizes', () => {
  it('family: at least 400 words in 120 themes; spicy: 120 words in 36 themes', () => {
    expect(FAMILY_WORDS.length).toBeGreaterThanOrEqual(400);
    expect(FAMILY_THEMES.length).toBeGreaterThanOrEqual(120);
    expect(SPICY_WORDS.length).toBeGreaterThanOrEqual(120);
    expect(SPICY_THEMES.length).toBeGreaterThanOrEqual(36);
  });
});

describe('words', () => {
  it('ids are unique after normalizing and each shows as its capitals', () => {
    const seen = new Set<string>();
    for (const w of ALL) {
      const n = normalize(w.id, 'en').compact;
      expect(seen.has(n), w.id).toBe(false);
      seen.add(n);
      expect(w.word).toBe(w.id.toUpperCase());
      expect(w.word.length).toBeLessThanOrEqual(10);
    }
  });

  it('each family word sits in 2+ family themes, each spicy word in 2+ spicy themes, as listed', () => {
    for (const [words, themes] of [
      [FAMILY_WORDS, FAMILY_THEMES],
      [SPICY_WORDS, SPICY_THEMES],
    ] as const) {
      const m = memberships(words, themes);
      for (const w of words) {
        expect(m.get(w.id)?.length ?? 0, w.id).toBeGreaterThanOrEqual(2);
        expect([...w.themes].sort(), w.id).toEqual([...(m.get(w.id) ?? [])].sort());
      }
    }
  });

  it('both hints are legal clues for their own word', () => {
    for (const w of ALL)
      for (const h of w.hints)
        expect(isLegalClue(h, { answer: w.id, family: w.family }, opts), `${w.id}:${h}`).toEqual({
          ok: true,
        });
  });
});

describe('themes', () => {
  it('members exist; the clue and every alt are legal against every member', () => {
    for (const t of [...FAMILY_THEMES, ...SPICY_THEMES]) {
      for (const m of t.members) {
        const w = ALL.find((x) => x.id === m);
        expect(w, `${t.id}:${m}`).toBeDefined();
        for (const c of [t.clue, ...t.alts])
          expect(
            isLegalClue(c, { answer: m, family: wordEntry(m).family }, opts),
            `${t.id}:${c}×${m}`,
          ).toEqual({ ok: true });
      }
    }
  });

  it('family themes use family words only (a family board never needs the spicy pack)', () => {
    const family = new Set(FAMILY_WORDS.map((w) => w.id));
    for (const t of FAMILY_THEMES)
      for (const m of t.members) expect(family.has(m), `${t.id}:${m}`).toBe(true);
  });
});

describe('boards', () => {
  it('25 distinct words with no root clash, family and spicy, across 200 seeds', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const spicy = seed % 4 === 0;
      const { board, themes } = drawBoard(seedRng(seed), spicy, []);
      expect(board).toHaveLength(25);
      expect(themes.length).toBe(5);
      const words = board.map((c) => wordEntry(c.itemId));
      for (let i = 0; i < words.length; i++)
        for (let j = i + 1; j < words.length; j++)
          expect(
            clashes(words[i] as Word, words[j] as Word),
            `${seed}: ${words[i]?.id}/${words[j]?.id}`,
          ).toBe(false);
      if (!spicy)
        expect(board.every((c) => FAMILY_WORDS.some((w) => w.id === c.itemId))).toBe(true);
    }
  });

  it('never pairs SUN with SUNFLOWER', () => {
    const sun = wordEntry('sun');
    const sunflower = wordEntry('sunflower');
    expect(clashes(sun, sunflower)).toBe(true);
  });
});

describe('the key', () => {
  it.each([
    ['teams', 1, { sun: 9, moon: 8, bystander: 7, assassin: 1 }],
    ['teams', 2, { sun: 9, moon: 8, bystander: 6, assassin: 2 }],
    ['coop', 1, { sun: 9, moon: 0, bystander: 15, assassin: 1 }],
    ['coop', 2, { sun: 9, moon: 0, bystander: 14, assassin: 2 }],
  ] as const)('%s with %i assassin(s)', (mode, assassins, want) => {
    const [key] = dealKey(seedRng(7), mode, 'sun', assassins);
    const count = (k: string) => key.filter((x) => x === k).length;
    expect({
      sun: count('sun'),
      moon: count('moon'),
      bystander: count('bystander'),
      assassin: count('assassin'),
    }).toEqual(want);
  });

  it('the starting team has 9 agents', () => {
    const [key] = dealKey(seedRng(3), 'teams', 'moon', 1);
    expect(key.filter((k) => k === 'moon')).toHaveLength(9);
    expect(key.filter((k) => k === 'sun')).toHaveLength(8);
  });
});
