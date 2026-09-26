// Echo's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import { lazy } from 'react';
import type { GameTvModule } from '@partybox/game-sdk/ui';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // The guess and result stages deal their own entrance.
  quickInto: ['guess', 'result'],
  // The guesser, throughout.
  stripActive: (view) => {
    const g = (view as { guesser?: string | null }).guesser;
    return g ? [g] : [];
  },
  // Co-op: the deck counter is the score.
  stripScores: () => false,
  finale: (view) => view.phaseId === 'done' || Boolean((view as { final?: unknown }).final),
  Finale: lazy(() => import('./Finale').then((m) => ({ default: m.Finale }))),
};
