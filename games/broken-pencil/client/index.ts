// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const clientModule: GameClientModule = {
  id: 'broken-pencil',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // No points: the results headline says the show is over, and the summary stays up there.
  scoreless: true,
  finale: (view) => view.phaseId === 'summary' || view.phaseId === 'done',
  Finale: lazy(() => import('./Finale').then((m) => ({ default: m.Finale }))),
  // Every page of the show is its own phase instance and the shell chimes each one (review-loop
  // #93): the soft 'card' pluck turns a page; the full 'reveal' was too much twenty-five times.
  sounds: { show: 'card' },
  // A page turn is a cut, like flipping a book: the 300 ms dissolve blended the dark page over
  // the white sheet (a grey flash on every drawing, loop 412).
  quickInto: ['show'],
  // Owner pick: lounge tracks, quiet, only while people draw and guess (never over the reveal).
  music: {
    tracks: ['backbay-lounge', 'lobby-time', 'hep-cats'],
    volume: 0.2,
    mode: 'chain',
    phases: ['draw', 'guess', 'pass'],
  },
};
