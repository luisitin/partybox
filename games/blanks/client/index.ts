// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';

export const clientModule: GameClientModule = {
  id: 'blanks',
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // Every reveal step is its own phase instance: one soft 'card' pluck per card read out (the
  // owner's pick over the fuller 'reveal', which was too much three cards in a row).
  sounds: { reveal: 'card', result: 'tally' },
  // Music beds (ADR-032, owner's picks 2026-09-17): the warm groove is the general background
  // (round card, read-out, result — it resumes where it left off), the soft bossa plays while
  // people pick a card, the marimba pulse while the room judges. Results stay silent under the
  // win fanfare.
  beds: { intro: 'warm', answer: 'bossa', reveal: 'warm', judge: 'marimba', result: 'warm' },
  // The point lands on result entry but the stage names the winner on its last beat: the strip
  // waits for the next phase.
  stripScores: (view) => view.phaseId !== 'result',
};
