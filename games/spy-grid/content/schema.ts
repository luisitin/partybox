// Content pack schemas (SPEC §9.20). `packs` maps content/<name>.json → its schema; the contract
// suite validates every pack with it, and content.test.ts checks the cross-pack rules (every word
// in 2+ themes, every theme clue legal against its own members, no duplicate after normalizing).
import { z } from '@partybox/game-sdk';

const lower = z.string().regex(/^[a-z]+$/);

export const wordSchema = z.object({
  id: lower.max(10),
  /** Shown in capitals; single word, at most 10 letters. */
  word: z.string().regex(/^[A-Z]{2,10}$/),
  themes: z.array(lower.max(20)).min(2),
  /** Two one-word clues that point at this word alone (the bot spymaster's fallback). */
  hints: z.array(lower.min(3).max(20)).length(2),
  /** Roots that give the word away (SUNFLOWER → sun, flower). */
  family: z.array(lower.min(2).max(12)).min(1),
});
export type Word = z.infer<typeof wordSchema>;

export const themeSchema = z.object({
  id: lower.max(20),
  clue: lower.max(20),
  alts: z.array(lower.max(20)).min(2).max(3),
  /** Most obvious first — the bot guesser follows this order. */
  members: z.array(lower.max(10)).min(6).max(12),
});
export type Theme = z.infer<typeof themeSchema>;

export const wordsPackSchema = z.object({
  lang: z.enum(['en', 'es']),
  words: z.array(wordSchema).min(100),
});
export const themesPackSchema = z.object({ themes: z.array(themeSchema).min(30) });

/** Per-game pronunciation fixes (Part 00 §5.4 as amended: `ipa` wire name, case-sensitive). */
export const pronunciationsSchema = z.object({
  words: z.record(
    z.string().min(1).max(20),
    z.object({ say: z.string().min(1).max(40), ipa: z.string().min(1).max(60).optional() }),
  ),
});

export const packs = {
  words: wordsPackSchema,
  themes: themesPackSchema,
  'spicy-words': wordsPackSchema.extend({ words: z.array(wordSchema).min(60) }),
  'spicy-themes': z.object({ themes: z.array(themeSchema).min(12) }),
  pronunciations: pronunciationsSchema,
} as const;
