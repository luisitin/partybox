// Content pack schemas. `packs` maps content/<name>.json → its zod schema; the contract suite
// validates every pack with it. Words carry a difficulty (1 easy … 3 hard); each player is offered
// one of each, so every pool must hold at least maxPlayers words.
import { z } from '@partybox/game-sdk';

export const wordsPackSchema = z.object({
  pack: z.enum(['family', 'spicy']),
  words: z
    .array(
      z.object({ text: z.string().min(2).max(30), difficulty: z.number().int().min(1).max(3) }),
    )
    .min(8),
});
export type WordsPack = z.infer<typeof wordsPackSchema>;

export const linesPackSchema = z.object({
  intact: z.array(z.string().min(1).max(60)).min(3),
  broken: z.array(z.string().min(1).max(60)).min(3),
  /** The test bot's vocabulary (players never see it). */
  botGuesses: z.array(z.string().min(1).max(20)).min(40),
});
export type LinesPack = z.infer<typeof linesPackSchema>;

/** ADR-054: a Spanish words pack. Each entry names the English word it stands for (`en`), so the
 *  content test can prove one ES entry per English word. Spanish runs longer: up to 60 chars (a
 *  guess may be as long). */
export const wordsEsPackSchema = z.object({
  pack: z.enum(['family', 'spicy']),
  lang: z.literal('es'),
  words: z
    .array(
      z.object({
        en: z.string().min(2).max(30),
        text: z.string().min(2).max(60),
        difficulty: z.number().int().min(1).max(3),
      }),
    )
    .min(8),
});
export type WordsEsPack = z.infer<typeof wordsEsPackSchema>;

/** ADR-054: the Spanish lines, index-aligned with lines.json. */
export const linesEsPackSchema = linesPackSchema.extend({ lang: z.literal('es') });

export const packs = {
  words: wordsPackSchema,
  'words-spicy': wordsPackSchema,
  lines: linesPackSchema,
  'words.es': wordsEsPackSchema,
  'words-spicy.es': wordsEsPackSchema,
  'lines.es': linesEsPackSchema,
} as const;
