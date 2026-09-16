// Content pack schemas. `packs` maps content/<name>.json → its zod schema; the contract suite
// validates every pack with it. Calls are keyed by number: the family pack must cover 1–75, the
// spicy pack overrides any subset.
import { z } from '@partybox/game-sdk';

export const callsPackSchema = z
  .object({
    pack: z.enum(['family', 'spicy']),
    calls: z
      .array(z.object({ number: z.number().int().min(1).max(75), call: z.string().min(1).max(48) }))
      .min(1),
  })
  .refine((p) => p.pack !== 'family' || new Set(p.calls.map((c) => c.number)).size === 75, {
    message: 'the family pack must cover every number 1..75',
  });
export type CallsPack = z.infer<typeof callsPackSchema>;

export const packs = { calls: callsPackSchema, 'calls-spicy': callsPackSchema } as const;
