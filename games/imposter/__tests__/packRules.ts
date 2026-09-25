// The Imposter pack rules (SPEC §1.14 + Part 00 §4.2), as one function that returns every problem
// found. content.test.ts runs it on the real packs; content writers run it on a draft category.
import { isLegalClue, matchAnswer, normalize, sameAnswer } from '../match';
import { categorySchema } from '../content/schema';
import type { Category } from '../content/schema';

export interface PackProblems {
  errors: string[];
  warnings: string[];
}

const compact = (t: string): string => normalize(t, 'en').compact;

export function checkCategory(raw: unknown, words = 12): PackProblems {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((i) => `schema ${i.path.join('.')}: ${i.message}`),
      warnings,
    };
  }
  const cat: Category = parsed.data;
  const where = (id: string): string => `${cat.category}/${id}`;
  if (cat.words.length !== words)
    errors.push(`${cat.category}: ${cat.words.length} words, want ${words}`);

  const seenAnswers = new Map<string, string>();
  for (const w of cat.words) {
    if (!w.id.startsWith(`${cat.category}-`))
      errors.push(`${where(w.id)}: id must start with "${cat.category}-"`);
    const forms = [w.answer, ...w.accept];
    // Every entry distinct after normalization (spacing/case/accent variants are automatic).
    const seen = new Map<string, string>();
    for (const f of forms) {
      const c = compact(f);
      if (seen.has(c))
        errors.push(`${where(w.id)}: "${f}" equals "${seen.get(c)}" once normalized`);
      seen.set(c, f);
    }
    for (const r of w.reject)
      if (seen.has(compact(r))) errors.push(`${where(w.id)}: reject "${r}" is also accepted`);
    for (const a of w.accept)
      if (matchAnswer(a, w) !== 'exact')
        errors.push(`${where(w.id)}: accept "${a}" does not match exact`);
    if (w.accept.length < 6)
      warnings.push(`${where(w.id)}: only ${w.accept.length} accept forms (aim 6+)`);
    if (w.answer.includes(' ') && w.family.length === 0)
      warnings.push(`${where(w.id)}: multi-word answer with no family roots`);
    // Crew clues: legal, distinct, never another word's accept form in this category.
    const clueSeen: string[] = [];
    for (const clue of w.clues) {
      const v = isLegalClue(clue, w, { oneWord: true, maxChars: 20 });
      if (!v.ok) errors.push(`${where(w.id)}: clue "${clue}" is illegal (${v.reason})`);
      if (clueSeen.some((c) => sameAnswer(c, clue)))
        errors.push(`${where(w.id)}: clue "${clue}" repeats another clue`);
      clueSeen.push(clue);
    }
    const key = compact(w.answer);
    if (seenAnswers.has(key)) errors.push(`${where(w.id)}: duplicate answer`);
    seenAnswers.set(key, w.id);
  }
  // Every word must be a fair last-chance decoy for at least 5 others (no shared accept/family).
  for (const w of cat.words) {
    const fair = cat.words.filter((o) => o.id !== w.id && !sharesForm(w, o)).length;
    if (fair < 5) errors.push(`${where(w.id)}: only ${fair} fair decoys in its category (need 5)`);
  }
  // Imposter clues: vague enough to fit every word, never a word's accept or family, legal for all.
  const impSeen: string[] = [];
  for (const clue of cat.imposterClues) {
    for (const w of cat.words) {
      const v = isLegalClue(clue, w, { oneWord: true, maxChars: 20 });
      if (!v.ok)
        errors.push(
          `${cat.category}: imposter clue "${clue}" is illegal for ${w.id} (${v.reason})`,
        );
      if (w.family.some((f) => compact(f) === compact(clue)))
        errors.push(`${cat.category}: imposter clue "${clue}" is a family root of ${w.id}`);
    }
    if (impSeen.some((c) => sameAnswer(c, clue)))
      errors.push(`${cat.category}: imposter clue "${clue}" repeats`);
    impSeen.push(clue);
  }
  return { errors, warnings };
}

/** True when two words share an accepted form or a family root (then one can't decoy the other). */
export function sharesForm(a: Category['words'][number], b: Category['words'][number]): boolean {
  const fa = new Set([a.answer, ...a.accept].map(compact));
  if ([b.answer, ...b.accept].some((f) => fa.has(compact(f)))) return true;
  const ra = new Set(a.family.map(compact));
  return b.family.some((f) => ra.has(compact(f)));
}
