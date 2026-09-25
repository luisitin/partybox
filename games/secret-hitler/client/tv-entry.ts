// The TV entry (ADR-050): the registry downloads it on the TV once the game is chosen, never on a
// phone. The game's own seat row replaces the platform strip in every phase (§4).
import type { GameTvModule } from '@partybox/game-sdk/ui';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // Every phase (server/types.ts PHASES; not imported, so zod stays out of the bundle).
  stripHidden: [
    'seating',
    'nominate',
    'vote',
    'voteReveal',
    'hitlerCheck',
    'presDraw',
    'chanEnact',
    'vetoAsk',
    'enactReveal',
    'claims',
    'power',
    'powerReveal',
    'chaos',
    'gameOver',
    'done',
  ],
  quickInto: ['voteReveal', 'hitlerCheck', 'chaos', 'enactReveal', 'powerReveal', 'gameOver'],
};
