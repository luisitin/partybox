// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import type { LightningTvView } from '../server/views';

export const clientModule: GameClientModule = {
  id: 'lightning-round',
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // The final-wager board stays on the results stage until someone presses Play again / Home.
  finale: (view) => view.phaseId === 'reveal' && Boolean((view as LightningTvView).round?.final),
  Finale: lazy(() => import('./Finale').then((m) => ({ default: m.Finale }))),
  sounds: { reveal: 'reveal', wager: 'wager' },
};
