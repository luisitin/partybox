// Echo's content packs (docs/game-pack/echo/SPEC.md §7.15). Every word is an answer item
// (docs/game-pack/schemas/answer-item.schema.json) plus a category and a bank of ten clues, ordered
// from most to least obvious, that bots write and bot guessers read.
import { z } from '@partybox/game-sdk';

export const CATEGORIES = [
  'animals',
  'food',
  'objects',
  'places',
  'jobs',
  'nature',
  'activities',
  'fantasy',
  'sports',
  'house',
] as const;
export type Category = (typeof CATEGORIES)[number];

const lower = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[^A-Z]*$/, 'lowercase only');

export const wordItemSchema = z.object({
  id: z.string().regex(/^echo-[a-z]+-\d{3}$/),
  category: z.enum(CATEGORIES),
  answer: lower.max(24),
  accept: z.array(lower).min(3),
  reject: z.array(lower),
  family: z.array(lower.min(3)),
  // Written as displayed (a proper noun may be capitalised); one word each, ≤ 20 characters.
  clues: z.array(z.string().min(1).max(20)).length(10),
});
export type WordItem = z.infer<typeof wordItemSchema>;

export const wordPackSchema = z.object({
  lang: z.literal('en'),
  words: z.array(wordItemSchema).min(10),
});
export type WordPack = z.infer<typeof wordPackSchema>;

// Speech overrides for the reader (foundation §5.4; the shared schema lands with F6).
export const pronunciationsSchema = z.object({
  words: z.record(z.string(), z.object({ say: z.string().min(1), ipa: z.string().optional() })),
});

export const packs = {
  family: wordPackSchema,
  spicy: wordPackSchema,
  pronunciations: pronunciationsSchema,
} as const;
