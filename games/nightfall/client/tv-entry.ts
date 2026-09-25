// Nightfall's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import { lazy } from 'react';
import type { GameTvModule } from '@partybox/game-sdk/ui';
import type { NightfallTvView } from '../server/index';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // The dark stage is the mood at night: the strip goes (SPEC §10.4 client hooks).
  stripHidden: ['night'],
  stripActive: (view) => {
    const v = view as unknown as NightfallTvView;
    if (v.phaseId === 'verdict' && v.step >= 1 && v.stage.verdict?.out)
      return [v.stage.verdict.out];
    if (v.phaseId === 'hunter' && v.stage.hunter) return [v.stage.hunter.id];
    return [];
  },
  quickInto: ['dawn', 'verdict', 'end'],
  // Every role on the end board stays on the results screen.
  finale: (view) => view.phaseId === 'end' || view.phaseId === 'done',
  Finale: lazy(() => import('./TvEnd').then((m) => ({ default: m.Finale }))),
};
