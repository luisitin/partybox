// Wisecrack's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // Points land on reveal entry but the stage reveals authors 700 ms apart: the strip waits for
  // the scores phase (R-068).
  stripScores: (view) => view.phaseId !== 'reveal',
};
