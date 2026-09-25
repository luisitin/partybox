// Typed access to content/*.json (host only: no client file imports this). `drawQuestions` puts
// exactly the rounds' questions into state — the rest of the packs never reach a view (§2.5).
import { shuffle } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import { pronunciationsSchema, questionPackSchema } from '../content/schema';
import type { Pronunciations, Question } from '../content/schema';
import familyJson from '../content/family.json' with { type: 'json' };
import spicyJson from '../content/spicy.json' with { type: 'json' };
import pronunciationsJson from '../content/pronunciations.json' with { type: 'json' };

export const FAMILY: readonly Question[] = questionPackSchema.parse(familyJson);
export const SPICY: readonly Question[] = questionPackSchema.parse(spicyJson);
export const PRONUNCIATIONS: Pronunciations = pronunciationsSchema.parse(pronunciationsJson);

/**
 * The game's questions, one per round. Spicy on: half the rounds (rounded up) come from the spicy
 * pack, mixed in at random places — "adds the spicy pack" should be felt in a six-round game,
 * which a plain 50-in-200 draw would not promise.
 */
export function drawQuestions(
  rng: RngState,
  rounds: number,
  spicy: boolean,
): [Question[], RngState] {
  const spicyCount = spicy ? Math.ceil(rounds / 2) : 0;
  const [family, r1] = shuffle(rng, FAMILY);
  const [hot, r2] = shuffle(r1, SPICY);
  const picked = [...hot.slice(0, spicyCount), ...family.slice(0, rounds - spicyCount)];
  return shuffle(r2, picked);
}
