// Hive Rank's phone entry (ADR-050): downloaded once the game is chosen, never by the TV.
import { lazy } from 'react';
import type { GamePhoneModule } from '@partybox/game-sdk/ui';
import { Controller } from './Controller';
import { shared } from './shared';

export const phone: GamePhoneModule = {
  ...shared,
  Controller,
  // Phone-only rooms (and remote phones, ADR-047): the hive's ladder on the phone. `intro` and
  // `score` stay the Controller, which draws the room's board itself there and keeps the VIP's
  // Next button (PhoneStage has no `skip`) — NOTES.md.
  PhoneStage: lazy(() =>
    import('./PhoneStage').then((m) => ({ default: m.PhoneStage })),
  ) as unknown as GamePhoneModule['PhoneStage'],
  phoneStagePhases: ['hive'],
};
