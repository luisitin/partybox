// Imposter's phone entry (ADR-050): downloaded once the game is chosen, never by the TV.
import { lazy } from 'react';
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { shared } from './shared';

export const phone: GamePhoneModule = {
  ...shared,
  Controller,
  PhoneStage: lazy(() =>
    import('./PhoneStage').then((m) => ({ default: m.PhoneStage })),
  ) as unknown as GamePhoneModule['PhoneStage'],
  // The paced reveals; intro, the word reveal and scores stage inside the Controller (VIP buttons).
  phoneStagePhases: ['clueReveal', 'voteReveal', 'accuse'],
};
