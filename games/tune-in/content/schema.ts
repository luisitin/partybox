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

const endsSchema = z.object({
  left: z.string().min(1).max(LABEL_MAX_CHARS),
  right: z.string().min(1).max(LABEL_MAX_CHARS),
});

export const spectrumSchema = z.object({
  id: z.string().regex(/^tn-[a-z]+(-[a-z]+)*-\d{3}$/),
  left: z.string().min(1).max(LABEL_MAX_CHARS),
  right: z.string().min(1).max(LABEL_MAX_CHARS),
  /** The dial's ends in (Latin American) Spanish: short labels that frame the game get Spanish in
   *  the pack; the clues stay English (decision [196a9e]). */
  es: endsSchema,
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

/** ADR-054: one dial's Spanish bank (Session C's hand-off, [f58857]): the same id as the English
 *  dial, its Spanish ends and twelve clues written in Spanish, each with its own spot on the dial. */
export const spectrumEsSchema = z.object({
  id: spectrumSchema.shape.id,
  es: endsSchema,
  clues: z.array(bankClueSchema).length(BANK_CLUES),
});
export type SpectrumEs = z.infer<typeof spectrumEsSchema>;

export const spectrumEsPackSchema = z.object({
  lang: z.literal('es'),
  spectra: z.array(spectrumEsSchema).min(1),
});
export type SpectrumEsPack = z.infer<typeof spectrumEsPackSchema>;

export const packs = {
  family: spectrumPackSchema,
  spicy: spectrumPackSchema,
  pronunciations: pronunciationsSchema,
} as const;
