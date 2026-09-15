// Content pack schemas. `packs` maps content/<name>.json → its zod schema; the contract suite
// validates every pack with it. Two shapes: the family pack also carries the bot's answers.
import { z } from '@partybox/game-sdk';

export const ANSWER_MAX_CHARS = 80;

export const promptSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]{1,31}$/),
  text: z.string().min(1).max(120),
});
export type Prompt = z.infer<typeof promptSchema>;

/** Prompt ids must be unique inside a pack (and, by the f/s prefix convention, across packs). */
function uniqueIds(prompts: Prompt[]): boolean {
  return new Set(prompts.map((p) => p.id)).size === prompts.length;
}

export const familyPackSchema = z.object({
  prompts: z.array(promptSchema).min(150).refine(uniqueIds, { message: 'duplicate prompt id' }),
  botAnswers: z.array(z.string().min(1).max(ANSWER_MAX_CHARS)).min(40),
});
export type FamilyPack = z.infer<typeof familyPackSchema>;

export const spicyPackSchema = z.object({
  prompts: z.array(promptSchema).min(50).refine(uniqueIds, { message: 'duplicate prompt id' }),
});
export type SpicyPack = z.infer<typeof spicyPackSchema>;

export const packs = { family: familyPackSchema, spicy: spicyPackSchema } as const;
