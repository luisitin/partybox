// The packs (README "Content"; SPEC §6.13): sizes, lengths, ids, opinions only, and every line
// the voice will read comes out clean.
import { describe, expect, it } from 'vitest';
import { drawQuestions, FAMILY, SPICY } from '../server/content';
import { speakable } from '../server/speech';
import { seedRng } from '@partybox/game-sdk';

const ALL = [...FAMILY, ...SPICY];

describe('packs', () => {
  it('family 150, spicy 50, every question id unique', () => {
    expect(FAMILY).toHaveLength(150);
    expect(SPICY).toHaveLength(50);
    expect(new Set(ALL.map((q) => q.id)).size).toBe(ALL.length);
  });

  it('no two prompts alike inside a pack', () => {
    for (const pack of [FAMILY, SPICY]) {
      const norm = pack.map((q) =>
        q.prompt
          .toLowerCase()
          .replace(/\b(a|an|the)\b/g, '')
          .replace(/[^a-z]/g, ''),
      );
      expect(new Set(norm).size).toBe(pack.length);
    }
  });

  it('every kind is well represented in the family pack', () => {
    const kinds: Record<string, number> = {};
    for (const q of FAMILY) kinds[q.kind] = (kinds[q.kind] ?? 0) + 1;
    for (const kind of ['preference', 'usefulness', 'hypothetical', 'social'])
      expect(kinds[kind] ?? 0).toBeGreaterThanOrEqual(20);
  });

  it('labels fit (≤ 22) and are not listed in the expected order', () => {
    for (const q of ALL) {
      for (const item of q.items)
        expect(item.label.length, `${q.id} ${item.label}`).toBeLessThanOrEqual(22);
      expect(q.expected.join(), q.id).not.toBe(q.items.map((i) => i.id).join());
    }
  });

  it('avoids words that mean different things in different countries', () => {
    const risky = /^(chips|biscuits?|football|pants|jumper|crisps|jelly)$/i;
    for (const q of ALL) for (const item of q.items) expect(item.label, q.id).not.toMatch(risky);
  });

  it('every reading comes out as plain words', () => {
    for (const q of ALL) {
      for (const text of [q.say, ...q.items.map((i) => `Number five: ${i.label}.`)]) {
        const said = speakable(text);
        expect(said, `${q.id}: ${text}`).not.toMatch(/\d/);
        expect(said, `${q.id}: ${text}`).toMatch(/^[A-Za-z][A-Za-z .,!?':;-]*$/);
      }
    }
  });
});

describe('drawing', () => {
  it('draws exactly the rounds, no repeats; spicy fills half the rounds', () => {
    const [family] = drawQuestions(seedRng(4), 10, false);
    expect(family).toHaveLength(10);
    expect(new Set(family.map((q) => q.id)).size).toBe(10);
    expect(family.every((q) => FAMILY.includes(q))).toBe(true);
    const [mixed] = drawQuestions(seedRng(4), 7, true);
    expect(mixed.filter((q) => SPICY.includes(q))).toHaveLength(4);
  });
});
