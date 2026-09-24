// Bingo's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // R2-01 A: whoever is one square from the pattern is ringed in the strip while it is true.
  stripActive: (view) => (view as { closeIds?: string[] }).closeIds ?? [],
  // I-131 A: a claim and its verdict need the stage — the strip shows faces only.
  stripCompact: ['check', 'bingo'],
  stripHidden: ['bingo'], // I-131 C
  // The ball dropping out of the cage is the entrance into play: cut, don't dissolve (loop 296).
  quickInto: ['play'],
};
