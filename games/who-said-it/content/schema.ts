// Content pack schemas (SPEC §4.14). `packs` maps content/<name>.json → its zod schema; the contract
// suite validates every pack with it. A prompt carries the bots' answer bank (12+, ≤ 60 characters,
// mixed styles) and a `kind` so the pack test can hold the 60 / 30 / 10 mix.
import { z } from '@partybox/game-sdk';
import { pronunciationsSchema } from '@partybox/game-sdk/speech';

export const BOT_ANSWER_MAX = 60;

export const promptItemSchema = z.object({
  id: z.string().regex(/^ws-[a-z0-9]+-\d{3}$/),
  kind: z.enum(['habit', 'hypothetical', 'self']),
  prompt: z.string().min(8).max(100),
  botAnswers: z.array(z.string().min(1).max(BOT_ANSWER_MAX)).min(12),
});
export type PackPrompt = z.infer<typeof promptItemSchema>;

function uniqueIds(prompts: PackPrompt[]): boolean {
  return new Set(prompts.map((p) => p.id)).size === prompts.length;
}

export const promptPackSchema = z.object({
  lang: z.literal('en'),
  prompts: z.array(promptItemSchema).min(1).refine(uniqueIds, { message: 'duplicate prompt id' }),
});
export type PromptPack = z.infer<typeof promptPackSchema>;

export const packs = {
  family: promptPackSchema,
  spicy: promptPackSchema,
  pronunciations: pronunciationsSchema,
} as const;
