// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const clientModule: GameClientModule = {
  id: 'echo',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // §7.3: `phase` = pick up your phone (clue, guess); `tally` = look at the TV (the check is the
  // clue-givers' own); the guess and the result cue themselves on their own beats (the guess's
  // chime must not be swallowed by the last Looks good tick in the same push).
  sounds: { intro: 'start', check: 'tally', guess: 'silence', result: 'silence' },
  beds: { intro: 'lounge', clue: 'lofi', check: 'lofi', guess: 'pulse', result: 'lofi' },
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
