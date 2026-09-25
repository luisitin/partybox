// Tune In's phone entry (ADR-050): downloaded once the game is chosen, never by the TV.
import { lazy } from 'react';
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { shared } from './shared';

export const phone: GamePhoneModule = {
  ...shared,
  Controller,
  // A phone-only room uses the dial stage for the reveal. Scores return to Controller so the VIP
  // has a visible Next round action rather than waiting for the scores timer to expire.
  PhoneStage: lazy(() => import('./PhoneStage').then((m) => ({ default: m.PhoneStage }))),
  phoneStagePhases: ['reveal'],
};
