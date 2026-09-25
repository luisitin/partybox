// Spy Grid's phone entry (ADR-050): downloaded once the game is chosen, never by the TV.
import { lazy } from 'react';
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { shared } from './shared';

export const phone: GamePhoneModule = {
  ...shared,
  Controller,
  PhoneStage: lazy(() => import('./PhoneStage').then((m) => ({ default: m.PhoneStage }))),
  phoneStagePhases: ['flip', 'turn-end', 'win'],
};
