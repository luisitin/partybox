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
  // I-007 B: while a question (or the wager) is open, whoever has not locked in is ringed.
  stripActive: (view) =>
    view.phaseId === 'question' || view.phaseId === 'wager'
      ? view.players.filter((p) => p.status === 'active' && p.connected).map((p) => p.id)
      : [],
  // Background music (owner request 2026-09-18): the phases flip every 5–15 s, so synthesized beds
  // (ADR-032), never file tracks. The intro rolls in on the marimba; question and reveal share the
  // quiz-show `pulse` (one bed, so it carries straight through the reveal cut and back into the
  // next question — the reveal sting ducks it); the wager holds its breath on the late-night
  // chords; the final question is the pulse again. `done` and the results stay silent.
  beds: { intro: 'marimba', question: 'pulse', reveal: 'pulse', wager: 'latenight' },
};
