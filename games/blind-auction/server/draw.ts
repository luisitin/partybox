// The chance-weighted draw shared by boxes (content.ts) and live events (events.ts).
import { nextFloat } from '@partybox/game-sdk';
import type { RngState } from '@partybox/game-sdk';
import type { BoxOption } from './types';

/** Draws the chance-weighted outcome index. */
export function drawOutcome(rng: RngState, options: readonly BoxOption[]): [number, RngState] {
  const [f, next] = nextFloat(rng);
  let roll = f * 100;
  for (let i = 0; i < options.length; i++) {
    roll -= options[i]?.chance ?? 0;
    if (roll < 0) return [i, next];
  }
  return [options.length - 1, next];
}
