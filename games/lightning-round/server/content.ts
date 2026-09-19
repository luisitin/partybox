// Typed access to content/questions.json. Imported statically (bundled, no I/O); parsed once at
// module load so a broken pack fails at import time and in the contract suite, never mid-game.
import { CATEGORIES, SUBCATEGORIES, labelOf, questionsPackSchema } from '../content/schema';
import type { Category, Question } from '../content/schema';
import questionsJson from '../content/questions.json' with { type: 'json' };

export const QUESTIONS: readonly Question[] = questionsPackSchema.parse(questionsJson).items;

const BY_ID: Readonly<Record<string, Question>> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export function questionById(id: string): Question | undefined {
  return Object.hasOwn(BY_ID, id) ? BY_ID[id] : undefined;
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/** The topic ids of a category (empty for `all` or an unknown category). */
export function subcategoriesOf(category: string): readonly string[] {
  return isCategory(category) ? SUBCATEGORIES[category] : [];
}

/**
 * Questions of one category, in pack order (empty for an unknown category); with `subcategories`,
 * only those topics.
 */
export function questionsIn(
  category: string,
  subcategories: readonly string[] = [],
): readonly Question[] {
  return QUESTIONS.filter(
    (q) =>
      q.category === category &&
      (subcategories.length === 0 || subcategories.includes(q.subcategory)),
  );
}

/** Human label for a category id or `all` (the manifest's select labels, without importing it). */
export function categoryLabel(category: string): string {
  return labelOf(category);
}

/** "Sports · Basketball, Soccer" — what the intro pill says the game draws from. */
export function drawLabel(category: string, subcategories: readonly string[]): string {
  const head = labelOf(category);
  return subcategories.length === 0 ? head : `${head} · ${subcategories.map(labelOf).join(', ')}`;
}
