// Bingo's phone entry (ADR-050): downloaded once the game is chosen, never by the TV.
import { lazy } from 'react';
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { shared } from './shared';

export const phone: GamePhoneModule = {
  ...shared,
  Controller,
  // S-005: in a phone-only room the check and the win are shown on every phone.
  PhoneStage: lazy(() =>
    import('./PhoneStage').then((m) => ({ default: m.PhoneStage })),
  ) as unknown as GamePhoneModule['PhoneStage'],
  phoneStagePhases: ['check'], // the win keeps the phone's own screen (the Next-round choice lives there)
};
