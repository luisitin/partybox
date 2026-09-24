// The packs (SPEC §4.14): 120 family + 50 spicy prompts, the 60/30/10 mix, 12+ bot answers each
// (≤ 60 characters, mixed styles, no two the same answer), prompts that anyone can answer.
import { describe, expect, it } from 'vitest';
import { FAMILY, SPICY } from '../server/content';
import { sameAnswer } from '../server/match';
import { toSpeakable } from '../server/speakable';

const ALL = [...FAMILY, ...SPICY];

describe('packs', () => {
  it('have the sizes the spec gives and unique ids across both', () => {
    expect(FAMILY).toHaveLength(120);
    expect(SPICY).toHaveLength(50);
    expect(new Set(ALL.map((p) => p.id)).size).toBe(170);
  });

  it('family mixes habits ~60 %, hypotheticals ~30 %, describe-yourself ~10 %', () => {
    const share = (k: string): number => FAMILY.filter((p) => p.kind === k).length / 120;
    expect(share('habit')).toBeCloseTo(0.6, 1);
    expect(share('hypothetical')).toBeCloseTo(0.3, 1);
    expect(share('self')).toBeCloseTo(0.1, 1);
  });

  it('no prompt is asked twice', () => {
    const norm = ALL.map((p) => p.prompt.toLowerCase().replace(/[^a-z ]/g, ''));
    expect(new Set(norm).size).toBe(norm.length);
  });

  it('family prompts assume nothing about partners, children, jobs, school, religion or money', () => {
    const banned = /\b(partner|boyfriend|girlfriend|wife|husband|spouse|your kids?|children|son|daughter|job|boss|coworkers?|office|school|teacher|class|church|pray|god|salary|money|rent|mortgage|debt|drunk|beer|wine)\b/i; // prettier-ignore
    for (const p of FAMILY) expect(p.prompt, p.id).not.toMatch(banned);
  });

  it('prompts are plain text a TV can read in three lines', () => {
    for (const p of ALL) {
      expect(p.prompt.length, p.id).toBeLessThanOrEqual(90);
      expect(p.prompt, p.id).not.toMatch(/[‘’“”]/);
      expect(toSpeakable(p.prompt).length, p.id).toBeGreaterThan(0);
    }
  });
});

describe('bot answers', () => {
  it('12+ per prompt, each 1–60 characters, none two the same answer', () => {
    for (const p of ALL) {
      expect(p.botAnswers.length, p.id).toBeGreaterThanOrEqual(12);
      for (const a of p.botAnswers) expect(a.length, `${p.id} ${a}`).toBeLessThanOrEqual(60);
      for (let i = 0; i < p.botAnswers.length; i += 1)
        for (let j = i + 1; j < p.botAnswers.length; j += 1)
          expect(
            sameAnswer(p.botAnswers[i] as string, p.botAnswers[j] as string),
            `${p.id}: "${p.botAnswers[i]}" ≈ "${p.botAnswers[j]}"`,
          ).toBe(false);
    }
  });

  it('come in mixed styles so bots do not all look alike', () => {
    for (const p of ALL) {
      const a = p.botAnswers;
      expect(a.filter((x) => x.endsWith('!!')).length, p.id).toBeGreaterThanOrEqual(1);
      expect(
        a.some((x) => x === x.toLowerCase()),
        `${p.id} lowercase`,
      ).toBe(true);
      expect(
        a.some((x) => /^[A-Z]/.test(x)),
        `${p.id} capitalised`,
      ).toBe(true);
      expect(
        a.some((x) => x.split(' ').length >= 3 || x.length >= 20),
        `${p.id} long`,
      ).toBe(true);
    }
  });
});
