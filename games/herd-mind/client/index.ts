// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
// When F1's per-surface registry lands this splits into phone.ts / tv.ts (docs/game-pack NOTES).
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import type { HerdTvView } from '../server/views';
import { STRINGS } from './strings';

export const clientModule: GameClientModule = {
  id: 'herd-mind',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // SPEC §2.4: `phase` (pick up your phone) for each question. `herd` and `score` play their own
  // cues (TvHerd: the tally as the cards take off, then a cheer or a bust; TvScore: the sweep):
  // the shell re-chimes a mapped phase whenever its deadline moves, and both re-time (the voice,
  // the settings hold), so they map to `silence`.
  sounds: { herd: 'silence', score: 'silence' },
  // The herd's own entrance is the choreography: cut into it, don't rise under a ghost.
  quickInto: ['herd'],
  // The strip never leads the stage: no running totals while the herd lands.
  stripScores: (view) => view.phaseId !== 'herd',
  // SPEC: the strip rings the Black Sheep's holder during `score` (where it shows).
  stripActive: (view) => {
    const sheep = (view as unknown as HerdTvView).sheep;
    return view.phaseId === 'score' && sheep ? [sheep] : [];
  },
  // The pens and the lanes show every face: the stage takes the room there.
  // The ready-up shows every face in its own row; the pens and the lanes show them too.
  stripHidden: ['intro', 'herd', 'score'],
  beds: { intro: 'bossa', answer: 'bossa', herd: 'bossa', score: 'warm' },
};
