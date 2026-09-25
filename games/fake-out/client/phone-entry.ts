// Fake-Out's phone entry (ADR-050): downloaded once the game is chosen, never by the TV.
import { lazy } from 'react';
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { shared } from './shared';

export const phone: GamePhoneModule = {
  ...shared,
  Controller,
  // A phone-only room reads the reveal as a feed; intro and scores keep the VIP's buttons.
  PhoneStage: lazy(() =>
    import('./PhoneStage').then((m) => ({ default: m.PhoneStage })),
  ) as unknown as GamePhoneModule['PhoneStage'],
  phoneStagePhases: ['reveal'],
};
