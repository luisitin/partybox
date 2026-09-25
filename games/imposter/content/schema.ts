// Content pack schemas (SPEC §1.14). `packs` maps content/<name>.json → its zod schema; the
// contract suite validates every pack with it. The deeper rules (accept forms, legal clues,
// imposter clues vs every word) live in __tests__/content.test.ts.
import { z } from '@partybox/game-sdk';

const lower = z
  .string()
  .min(1)
  .max(40)
  .refine((s) => s === s.toLowerCase(), 'lowercase only');
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const wordItemSchema = z.object({
  id: z.string().regex(ID),
  answer: lower,
  /** Same answer: plurals, misspellings, US/UK, true synonyms (Part 00 §4.2). 6+ where honest. */
  accept: z.array(lower).min(3),
  /** Close but wrong; blocks a fuzzy match. */
  reject: z.array(lower),
  /** Roots that give the word away as a clue (starfish → star, fish). */
  family: z.array(lower.refine((s) => s.length >= 3, '3+ letters')),
  /** 8–10 crew clues, each legal for this word; bots and the imposter's decoys use them. */
  clues: z.array(lower).min(8).max(10),
});
export type WordItem = z.infer<typeof wordItemSchema>;

export const categorySchema = z.object({
  category: z.string().regex(ID),
  label: z.string().min(1).max(24),
  /** Vague clues that fit every word here: what an imposter bot plays. 12+. */
  imposterClues: z.array(lower).min(12),
  words: z.array(wordItemSchema).min(12),
});
export type Category = z.infer<typeof categorySchema>;

export const wordPackSchema = z.object({
  /** The matcher's language for everything in this pack (owner ruling 15). */
  lang: z.literal('en'),
  categories: z.array(categorySchema).min(1),
});
export type WordPack = z.infer<typeof wordPackSchema>;

/** Game-level pronunciation overrides (Part 00 §5.4, owner ruling 17). */
export const pronunciationsSchema = z.record(
  z.string().min(1),
  z.object({
    say: z.string().min(1),
    ipa: z.string().min(1).optional(),
    anyCase: z.boolean().optional(),
  }),
);

export const packs = {
  family: wordPackSchema,
  spicy: wordPackSchema,
  pronunciations: pronunciationsSchema,
} as const;
