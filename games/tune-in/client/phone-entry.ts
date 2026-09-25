// Tune In's phone entry (ADR-050): downloaded once the game is chosen, never by the TV.
import { lazy } from 'react';
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { shared } from './shared';

export const phone: GamePhoneModule = {
  ...shared,
  Controller,
  // A phone-only room: the phones run the TV's stage for the reveal and the scores. The intro stays
  // the phone's own screen: it carries the rules and I'm ready [cc45f4].
  PhoneStage: lazy(() => import('./PhoneStage').then((m) => ({ default: m.PhoneStage }))),
  phoneStagePhases: ['reveal', 'scores'],
};
