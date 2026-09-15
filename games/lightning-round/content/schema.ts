// Content pack schema for Lightning Round. `packs` maps content/<name>.json → its zod schema; the
// contract suite validates every pack with it and server/content.ts parses it at import time.
import { z } from '@partybox/game-sdk';

/** Every category in the pack, in the order the settings `select` lists them. */
export const CATEGORIES = [
  'geography',
  'science',
  'history',
  'arts-and-literature',
  'sports',
  'food-and-drink',
  'nature',
  'language',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const MIN_QUESTIONS = 200;
export const MIN_CATEGORIES = 6;

export const questionSchema = z.object({
  id: z.string().regex(/^[a-z]{3}-\d{3}$/),
  category: z.enum(CATEGORIES),
  difficulty: z.enum(DIFFICULTIES),
  question: z.string().min(1).max(160),
  // Exactly four distinct choices; distractors must not duplicate the answer (case-insensitive).
  choices: z
    .array(z.string().min(1).max(60))
    .length(4)
    .refine((c) => new Set(c.map((s) => s.trim().toLowerCase())).size === 4, {
      message: 'choices must be four distinct strings',
    }),
  answerIndex: z.number().int().min(0).max(3),
  /** Short attribution note — the pack contains only widely documented, non-time-sensitive facts. */
  source: z.string().min(1).max(200),
});
export type Question = z.infer<typeof questionSchema>;

export const questionsPackSchema = z
  .object({ items: z.array(questionSchema).min(MIN_QUESTIONS) })
  .refine((p) => new Set(p.items.map((q) => q.id)).size === p.items.length, {
    message: 'question ids must be unique',
  })
  .refine((p) => new Set(p.items.map((q) => q.category)).size >= MIN_CATEGORIES, {
    message: `the pack needs at least ${MIN_CATEGORIES} categories`,
  });
export type QuestionsPack = z.infer<typeof questionsPackSchema>;

export const packs = { questions: questionsPackSchema } as const;
