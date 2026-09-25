// Broken Pencil's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import { lazy } from 'react';
import type { GameTvModule } from '@partybox/game-sdk/ui';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  finale: (view) => view.phaseId === 'summary' || view.phaseId === 'done',
  Finale: lazy(() => import('./Finale').then((m) => ({ default: m.Finale }))),
  // A page turn is a cut, like flipping a book: the 300 ms dissolve blended the dark page over
  // the white sheet (a grey flash on every drawing, loop 412).
  quickInto: ['show'],
};
