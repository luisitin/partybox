// Content pack guarantees from README.md "Content": size, categories, unique ids, four distinct
// choices, answerIndex in range, balanced answer positions, and the manifest's category options.
import { describe, expect, it } from 'vitest';
import { CATEGORIES, MIN_CATEGORIES, MIN_QUESTIONS, packs } from '../content/schema';
import questionsJson from '../content/questions.json' with { type: 'json' };
import { QUESTIONS, categoryLabel, questionsIn } from '../server/content';
import { game } from '../server/index';

describe('content/questions.json', () => {
  it('validates and has at least 200 items across at least 6 categories', () => {
    expect(packs.questions.safeParse(questionsJson).success).toBe(true);
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(MIN_QUESTIONS);
    const categories = new Set(QUESTIONS.map((q) => q.category));
    expect(categories.size).toBeGreaterThanOrEqual(MIN_CATEGORIES);
    expect([...categories].sort()).toEqual([...CATEGORIES].sort());
  });

  it('has unique ids and four distinct choices with the answer in range', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) {
      expect(q.choices, q.id).toHaveLength(4);
      expect(new Set(q.choices.map((c) => c.toLowerCase())).size, q.id).toBe(4);
      expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex, q.id).toBeLessThanOrEqual(3);
      expect(q.source.length, q.id).toBeGreaterThan(0);
    }
  });

  it('keeps categories roughly balanced and answer positions spread', () => {
    const counts = CATEGORIES.map((c) => questionsIn(c).length);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    expect(min).toBeGreaterThanOrEqual(20);
    expect(max - min).toBeLessThanOrEqual(10);
    const positions = [0, 1, 2, 3].map((i) => QUESTIONS.filter((q) => q.answerIndex === i).length);
    for (const n of positions) expect(n).toBeGreaterThanOrEqual(QUESTIONS.length / 8);
    // Every category can host a category-only game at the maximum question count.
    for (const c of CATEGORIES) expect(questionsIn(c).length).toBeGreaterThanOrEqual(21);
  });

  it('never uses the hidden-info key names in prose', () => {
    for (const q of QUESTIONS) {
      const text = `${q.question} ${q.choices.join(' ')}`;
      for (const key of ['correctIndex', 'pickIndex', 'wagerAmount'])
        expect(text, q.id).not.toContain(key);
    }
  });
});

describe('manifest', () => {
  it('lists every category (plus "all") in the category setting', () => {
    const setting = game.manifest.settings.find((s) => s.key === 'category');
    expect(setting?.type).toBe('select');
    if (setting?.type !== 'select') return;
    expect(setting.default).toBe('all');
    expect(setting.options.map((o) => o.value)).toEqual(['all', ...CATEGORIES]);
    for (const o of setting.options) expect(o.label).toBe(categoryLabel(o.value));
  });

  it('declares the five phases in order', () => {
    expect(game.phases).toEqual(['intro', 'question', 'reveal', 'wager', 'done']);
  });
});
