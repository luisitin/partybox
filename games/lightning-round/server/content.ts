// Typed access to content/questions.json. Imported statically (bundled, no I/O); parsed once at
// module load so a broken pack fails at import time and in the contract suite, never mid-game.
import { CATEGORIES, questionsPackSchema } from '../content/schema';
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

/** Questions of one category, in pack order (empty for an unknown category). */
export function questionsIn(category: string): readonly Question[] {
  return QUESTIONS.filter((q) => q.category === category);
}

/** Human label for a category id or `all` (the manifest's select labels, without importing it). */
export function categoryLabel(category: string): string {
  if (category === 'all') return 'All categories';
  return category
    .split('-')
    .map((w) => (w === 'and' ? '&' : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}
