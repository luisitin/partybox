// Tune In's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import { lazy } from 'react';
import type { GameTvModule, PushedView, TvView } from '@partybox/game-sdk/ui';
import type { TuneTvView } from '../server/index';
import { shared } from './shared';
import { Tv } from './Tv';

type TuneView = PushedView<TuneTvView>;

export const tv: GameTvModule = {
  ...shared,
  Tv,
  Finale: lazy(() => import('./Finale').then((m) => ({ default: m.Finale }))),
  // Teams and co-op keep their own last board (the rosters, the rating); solo's is the scoreboard.
  finale: (last: TuneView) => last.turn?.mode === 'teams' || last.turn?.mode === 'coop',
  // The dial stays put from clue to reveal: the stage cuts, and only what changes animates.
  quickInto: ['clue', 'dial', 'call', 'reveal'],
  // Spec §5.4 hides the strip's scores during dial and reveal. Tune In never shows them: scores
  // widen the chips and wrap the row, which jumped the stage at every change (p05, and the
  // reveal → scores crossfade in the 2026-09-24 burst), and the scores screen already has them
  // (the board, the banner or the meter).
  stripScores: () => false,
  stripActive: (view: PushedView<TvView>) => {
    const v = view as TuneView;
    if (v.phaseId === 'clue' || v.phaseId === 'dial')
      return v.turn?.psychic ? [v.turn.psychic] : [];
    if (v.phaseId === 'call' && v.teams && v.turn?.team)
      return v.teams[v.turn.team === 'sun' ? 'moon' : 'sun'];
    return [];
  },
};
