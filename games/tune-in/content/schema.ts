// Content pack schemas (spec §5.16). `packs` maps content/<name>.json → its zod schema; the contract
// suite validates every pack with it. The clue rules (legal against its own labels, a spread across
// every fifth of the dial) are pinned by __tests__/content.test.ts.
import { z } from '@partybox/game-sdk';
import { pronunciationsSchema } from '@partybox/game-sdk/speech';

export const LABEL_MAX_CHARS = 18;
export const BANK_CLUES = 12;

const bankClueSchema = z.object({
  text: z.string().min(1).max(30),
  pos: z.number().int().min(0).max(100),
});

export const spectrumSchema = z.object({
  id: z.string().regex(/^tn-[a-z]+(-[a-z]+)*-\d{3}$/),
  left: z.string().min(1).max(LABEL_MAX_CHARS),
  right: z.string().min(1).max(LABEL_MAX_CHARS),
  kind: z.enum(['measurable', 'opinion', 'playful']),
  clues: z.array(bankClueSchema).length(BANK_CLUES),
});
export type SpectrumItem = z.infer<typeof spectrumSchema>;
export type BankClue = z.infer<typeof bankClueSchema>;

export const spectrumPackSchema = z.object({
  lang: z.literal('en'),
  spectra: z.array(spectrumSchema).min(1),
});
export type SpectrumPack = z.infer<typeof spectrumPackSchema>;

export const packs = {
  family: spectrumPackSchema,
  spicy: spectrumPackSchema,
  pronunciations: pronunciationsSchema,
} as const;
