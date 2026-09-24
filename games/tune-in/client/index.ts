// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule, PushedView, TvView } from '@partybox/game-sdk/ui';
import type { TuneTvView } from '../server/index';
import { STRINGS } from './strings';

type TuneView = PushedView<TuneTvView>;

export const clientModule: GameClientModule = {
  id: 'tune-in',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  PhoneStage: lazy(() => import('./PhoneStage').then((m) => ({ default: m.PhoneStage }))),
  phoneStagePhases: ['intro', 'reveal', 'scores'],
  Finale: lazy(() => import('./Finale').then((m) => ({ default: m.Finale }))),
  // Teams and co-op keep their own last board (the banner, the rating); solo's is the scoreboard.
  finale: (last: TuneView) => last.turn?.mode === 'teams' || last.turn?.mode === 'coop',
  // Spec §5.4: dial and call are "pick up your phone" (unmapped); the clue's `card` and the
  // reveal's cues are played by the stage itself on their own frames (`silence` here, so the
  // reading never swallows the card and a re-armed beat never chimes); scores tally.
  sounds: { clue: 'silence', reveal: 'silence', scores: 'tally' },
  beds: { intro: 'lounge', clue: 'latenight', dial: 'marimba', call: 'pulse', scores: 'warm' },
  // The dial stays put from clue to reveal: the stage cuts, and only what changes animates.
  quickInto: ['clue', 'dial', 'call', 'reveal'],
  stripScores: (view: PushedView<TvView>) => view.phaseId !== 'dial' && view.phaseId !== 'reveal',
  stripActive: (view: PushedView<TvView>) => {
    const v = view as TuneView;
    if (v.phaseId === 'clue' || v.phaseId === 'dial')
      return v.turn?.psychic ? [v.turn.psychic] : [];
    if (v.phaseId === 'call' && v.teams && v.turn?.team)
      return v.teams[v.turn.team === 'sun' ? 'moon' : 'sun'];
    return [];
  },
};
