// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import type { NightfallTvView } from '../server/index';
import { STRINGS } from './strings';

export const clientModule: GameClientModule = {
  id: 'nightfall',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // SPEC §10.4: the plain `phase` chime means "pick up your phone" (night, vote); the reveals
  // sound like "look at the TV". The stepped phases (dawn, verdict, hunter, last words) move their
  // deadline on every step, and the shell re-chimes a mapped cue on each move — so they map to
  // `silence` and every one of their cues, the opening one included, is the scene's (useStepCue).
  sounds: {
    roles: 'card',
    night: 'phase',
    dawn: 'silence',
    hunter: 'silence',
    day: 'start',
    vote: 'phase',
    runoff: 'phase',
    verdict: 'silence',
    'last-words': 'silence',
    end: 'fanfare',
  },
  // SPEC §10.15 beds: late-night chords under the roles and the night, lo-fi by day, the pulse
  // under votes and the hunter; the reveals and the end are silent so the narrator carries them.
  beds: {
    roles: 'latenight',
    night: 'latenight',
    day: 'lofi',
    vote: 'pulse',
    runoff: 'pulse',
    hunter: 'pulse',
  },
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
  PhoneStage: lazy(() => import('./PhoneStage').then((m) => ({ default: m.PhoneStage }))),
  phoneStagePhases: ['dawn', 'verdict', 'end'],
};
