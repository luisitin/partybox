// Blind Auction's packs (SPEC §8.16): lots with 1–3 possible outcomes, each with a fixed chance.
// `packs` maps content/<name>.json → its zod schema; the contract suite validates every pack.
// lots.json holds the normal pool (chaos calm / normal) and the wild pool (chaos wild).
import { z } from '@partybox/game-sdk';

const chance = z.number().int().min(1).max(100);
const amount = z.number().int().min(5).max(2000).multipleOf(5);

export const outcomeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('gain'), amount, chance }),
  z.object({ type: z.literal('lose'), amount, chance }),
  z.object({ type: z.literal('steal'), percent: z.number().int().min(5).max(90), chance }),
  z.object({ type: z.literal('swap'), chance }),
  z.object({ type: z.literal('double'), chance }),
  z.object({ type: z.literal('refund'), chance }),
  z.object({ type: z.literal('dud'), chance }),
]);
export type Outcome = z.infer<typeof outcomeSchema>;
export type OutcomeType = Outcome['type'];

/** calm: gain, lose, double, refund and dud only · normal: may hide a heist or swap · wild: leans on them. */
export const CHAOS = ['calm', 'normal', 'wild'] as const;
export type Chaos = (typeof CHAOS)[number];

export const lotSchema = z
  .object({
    id: z.string().regex(/^ba-[a-z0-9-]{2,40}$/),
    name: z.string().min(2).max(20),
    icon: z.string().min(1).max(16),
    flavour: z.string().min(4).max(60),
    outcomes: z.array(outcomeSchema).min(1).max(3),
    chaos: z.enum(CHAOS),
  })
  .refine((lot) => lot.outcomes.reduce((sum, o) => sum + o.chance, 0) === 100, {
    message: 'chances must sum to 100',
  })
  .refine(
    (lot) =>
      lot.chaos !== 'calm' || lot.outcomes.every((o) => o.type !== 'steal' && o.type !== 'swap'),
    { message: 'a calm lot has no heist or swap' },
  );
export type Lot = z.infer<typeof lotSchema>;

export const lotPackSchema = z.array(lotSchema).min(1);
export type LotPack = z.infer<typeof lotPackSchema>;

/** Per-game pronunciation fixes (P00 §5.4, audit #21): whole words, case-sensitive unless `anyCase`. */
export const pronunciationsSchema = z.record(
  z.string().min(1),
  z.object({ say: z.string().min(1), anyCase: z.boolean().optional() }),
);
export type Pronunciations = z.infer<typeof pronunciationsSchema>;

export const packs = {
  lots: lotPackSchema,
  grand: lotPackSchema,
  spicy: lotPackSchema,
  pronunciations: pronunciationsSchema,
} as const;
