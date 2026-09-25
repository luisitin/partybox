// Hive Rank's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // The reveal's own entrance is the choreography (the ladder and "The hive has decided…").
  quickInto: ['hive'],
  // The strip never leads the stage: no running scores while the hive counts down.
  stripScores: (view) => view.phaseId !== 'hive',
  // Ring the round's Queen Bee(s) during `score`.
  stripActive: (view) => {
    if (view.phaseId !== 'score') return [];
    const score = (view as { score?: { queens?: string[] } | null }).score;
    return score?.queens ?? [];
  },
};
