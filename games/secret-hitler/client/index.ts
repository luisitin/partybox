// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
// M1: plain screens; the game's own seat row replaces the platform strip in every phase (§4).
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const clientModule: GameClientModule = {
  id: 'secret-hitler',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // Every phase (server/types.ts PHASES; not imported, so zod stays out of the phone bundle).
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
  // §12.2 with existing cues. powerReveal steps its deadline (ADR-033) and the choosing phases
  // move theirs on Last call, so those keep the shell's `phase` chime or stay silent.
  sounds: {
    seating: 'card',
    voteReveal: 'reveal',
    hitlerCheck: 'silence',
    enactReveal: 'reveal',
    chaos: 'bust',
    powerReveal: 'silence',
    gameOver: 'fanfare',
  },
  // §12.3: reveals hold their breath (no bed).
  beds: {
    seating: 'lounge',
    nominate: 'latenight',
    claims: 'latenight',
    vote: 'pulse',
    presDraw: 'pulse',
    chanEnact: 'pulse',
    vetoAsk: 'pulse',
    power: 'pulse',
  },
};
