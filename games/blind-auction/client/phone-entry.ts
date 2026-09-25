// Blind Auction's phone entry (ADR-050): downloaded once the game is chosen, never by the TV.
import { lazy } from 'react';
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { shared } from './shared';

export const phone: GamePhoneModule = {
  ...shared,
  Controller,
  // P00 §3.6 / S-005: a phone with no TV gets the reveal (the rules stay the phone's own screen:
  // it carries the Ready button).
  PhoneStage: lazy(() =>
    import('./PhoneStage').then((m) => ({ default: m.PhoneStage })),
  ) as unknown as GamePhoneModule['PhoneStage'],
  phoneStagePhases: ['open'],
};
