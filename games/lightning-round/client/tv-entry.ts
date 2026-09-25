// Lightning Round's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import { lazy } from 'react';
import type { GameTvModule } from '@partybox/game-sdk/ui';
import type { LightningTvView } from '../server/views';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // The final-wager board stays on the results stage until someone presses Play again / Home.
  finale: (view) => view.phaseId === 'reveal' && Boolean((view as LightningTvView).round?.final),
  Finale: lazy(() => import('./Finale').then((m) => ({ default: m.Finale }))),
  // I-007 B: while a question (or the wager) is open, whoever has not locked in is ringed.
  stripActive: (view) =>
    view.phaseId === 'question' || view.phaseId === 'wager'
      ? view.players.filter((p) => p.status === 'active' && p.connected).map((p) => p.id)
      : [],
};
