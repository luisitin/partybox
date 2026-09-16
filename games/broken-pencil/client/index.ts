// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';

export const clientModule: GameClientModule = {
  id: 'broken-pencil',
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  sounds: { show: 'reveal' },
  // Owner pick: lounge tracks, quiet, only while people draw and guess (never over the reveal).
  music: {
    tracks: ['backbay-lounge', 'lobby-time', 'hep-cats'],
    volume: 0.2,
    mode: 'chain',
    phases: ['draw', 'guess', 'pass'],
  },
};
