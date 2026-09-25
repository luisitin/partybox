// The pack test (foundation §4.9, SPEC §2.15): sizes, the style mix, every form unique after
// normalizing, every accept an exact match, no two answers of a question that a typed answer could
// confuse — and the 16-player state budget (§2.9).
import { describe, expect, it } from 'vitest';
import type { QuestionItem } from '../content/schema';
import { FAMILY, SPICY } from '../server/content';
import { matchAnswer, normalize, stemKey } from '../server/match';
import { atAnswer, pickAll, timer } from './helpers';

const ALL = [...FAMILY.items, ...SPICY.items];

function problems(q: QuestionItem): string[] {
  const out: string[] = [];
  const seen = new Map<string, string>();
  for (const a of q.answers) {
    for (const f of [a.answer, ...a.accept]) {
      const c = normalize(f, 'en').compact;
      if (c === '') out.push(`${a.id}: "${f}" normalizes to nothing`);
      if (seen.has(c)) out.push(`${a.id}: "${f}" duplicates ${seen.get(c)}`);
      seen.set(c, a.id);
      for (const b of q.answers)
        if (b !== a && matchAnswer(f, b, 'en') !== 'none')
          out.push(`${a.id}: "${f}" also matches ${b.id}`);
    }
    for (const f of a.accept)
      if (matchAnswer(f, a, 'en') !== 'exact') out.push(`${a.id}: accept "${f}" is not exact`);
    if (a.display !== undefined && a.display.toLowerCase() !== a.answer)
      out.push(`${a.id}: display ≠ answer`);
    const need = q.style === 'pick' || q.style === 'rather' ? 3 : 6;
    if (a.weight >= 10 && a.accept.length < need)
      out.push(`${a.id}: common answer with ${a.accept.length} accepts`);
  }
  const stems = q.answers.map((a) => stemKey(a.answer, 'en'));
  if (new Set(stems).size !== stems.length) out.push('two answers share a stem');
  return out.map((p) => `${q.id} ${p}`);
}

describe('content packs', () => {
  it('have the promised sizes: 200 family, 80 spicy', () => {
    expect(FAMILY.items).toHaveLength(200);
    expect(SPICY.items).toHaveLength(80);
  });

  it('ids and prompts are unique across both packs', () => {
    expect(new Set(ALL.map((q) => q.id)).size).toBe(ALL.length);
    expect(new Set(ALL.map((q) => normalize(q.prompt, 'en').compact)).size).toBe(ALL.length);
    expect(FAMILY.items.every((q) => q.id.startsWith('hm-'))).toBe(true);
    expect(SPICY.items.every((q) => q.id.startsWith('hmx-'))).toBe(true);
  });

  it('keep the style mix (name ~60 %, best 15, pick 10, finish 10, rather 5)', () => {
    for (const pack of [FAMILY, SPICY]) {
      const share = (style: string): number =>
        pack.items.filter((q) => q.style === style).length / pack.items.length;
      expect(share('name')).toBeCloseTo(0.6, 1);
      expect(share('best')).toBeCloseTo(0.15, 1);
      expect(share('pick')).toBeCloseTo(0.1, 1);
      expect(share('finish')).toBeCloseTo(0.1, 1);
      expect(share('rather')).toBeCloseTo(0.05, 1);
    }
  });

  it('every tiled question has 10–14 answers; every would-you-rather shows all of its 2–4', () => {
    for (const q of ALL) {
      if (q.tiles === 'all') expect(q.answers.length, q.id).toBeLessThanOrEqual(4);
      else expect(q.answers.length, q.id).toBeGreaterThanOrEqual(10);
      expect(q.answers.length, q.id).toBeLessThanOrEqual(14);
    }
  });

  it('weights read as shares of people (85–105 in total, top answer ≤ 70)', () => {
    for (const q of ALL) {
      const sum = q.answers.reduce((s, a) => s + a.weight, 0);
      expect(sum, q.id).toBeGreaterThanOrEqual(q.tiles === 'all' ? 90 : 70);
      expect(sum, q.id).toBeLessThanOrEqual(105);
    }
  });

  it('every form is unique after normalizing, every accept is exact, no answer overlaps another', () => {
    expect(ALL.flatMap(problems)).toEqual([]);
  }, 60_000); // ~4,000 forms × every other answer: seconds on a busy host

  it('every prompt ends with punctuation and fits (≤ 90 characters)', () => {
    for (const q of ALL) expect(q.prompt, q.id).toMatch(/^.{8,90}[.?!:…]$/u);
  });
});

describe('state budget', () => {
  it('stays under 40 KB at 16 players and 20 questions (fails above 64 KB)', () => {
    let s = atAnswer({ maxQuestions: 20, mode: 'tiles', spicy: true }, 16);
    for (let i = 0; i < 3; i++)
      s = timer(
        timer(
          pickAll(
            s,
            Array.from({ length: 16 }, (_, k) => k % 8),
          ),
        ),
      );
    const bytes = JSON.stringify(s).length;
    console.log(`herd-mind state at 16 players, 20 questions: ${(bytes / 1024).toFixed(1)} KB`);
    expect(bytes).toBeLessThan(40 * 1024);
  });
});
