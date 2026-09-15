// Drawing the question list: seeded, without repeats, category-filtered with a fallback, and a
// final question that prefers the hardest difficulty still available (README "Content").
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import type { Difficulty, Question } from '../content/schema';
import { QUESTIONS, questionsIn } from './content';

export interface Draw {
  ids: string[];
  /** `all` or the category actually used (the setting falls back to `all` when too small). */
  drawnFrom: string;
}

const HARDEST_FIRST: readonly Difficulty[] = ['hard', 'medium', 'easy'];

/** The pool a game draws from: the chosen category if it has `questions + 1` items, else everything. */
export function poolFor(
  category: string,
  questions: number,
): { pool: readonly Question[]; from: string } {
  if (category !== 'all') {
    const pool = questionsIn(category);
    if (pool.length >= questions + 1) return { pool, from: category };
  }
  return { pool: QUESTIONS, from: 'all' };
}

export function drawQuestions(
  rng: RngState,
  category: string,
  questions: number,
): [Draw, RngState] {
  const { pool, from } = poolFor(category, questions);
  const [shuffled, next] = shuffle(rng, pool);
  // Never more regular questions than leave one for the final (the pack guarantees >= 200 anyway).
  const regularCount = Math.max(0, Math.min(questions, shuffled.length - 1));
  const regular = shuffled.slice(0, regularCount);
  const rest = shuffled.slice(regularCount);
  const final =
    HARDEST_FIRST.map((d) => rest.find((q) => q.difficulty === d)).find((q) => q !== undefined) ??
    rest[0];
  const ids = regular.map((q) => q.id);
  if (final) ids.push(final.id);
  return [{ ids, drawnFrom: from }, next];
}
