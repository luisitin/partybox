// Herd Mind's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import type { HerdTvView } from '../server/views';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
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
  stripHidden: ['herd', 'score'],
};
