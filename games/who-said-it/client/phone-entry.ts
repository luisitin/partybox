// Who Said It's phone entry (ADR-050): downloaded once the game is chosen, never by the TV.
import { lazy } from 'react';
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { PhoneStage } from './PhoneStage';
import { shared } from './shared';

export const phone: GamePhoneModule = {
  ...shared,
  Controller,
  // Already in this chunk (it is small): no chunk of its own, so no extra file name in the join
  // download's preload list (check-bundle measured +1.1 KB with it split out).
  PhoneStage: lazy(() => Promise.resolve({ default: PhoneStage })),
  phoneStagePhases: ['prompt', 'reveal', 'scores'],
};
