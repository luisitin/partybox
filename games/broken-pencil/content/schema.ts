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

export const packs = {
  words: wordsPackSchema,
  'words-spicy': wordsPackSchema,
  lines: linesPackSchema,
} as const;
