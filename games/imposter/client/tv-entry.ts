// Imposter's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import { shared } from './shared';
import { Tv } from './Tv';

/** Phases whose stage shows scores only after the word is out (SPEC §1.3 stripScores). */
const HIDDEN_SCORES = new Set([
  'clueReveal',
  'talk',
  'vote',
  'voteReveal',
  'runoff',
  'accuse',
  'lastChance',
  'wordReveal',
]);

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // The table stays put from the deal to the vote: each of these phases brings its own entrance.
  quickInto: [
    'deal',
    'clue',
    'clueReveal',
    'talk',
    'vote',
    'voteReveal',
    'runoff',
    'accuse',
    'wordReveal',
  ],
  stripScores: (view) => !HIDDEN_SCORES.has(view.phaseId),
  stripActive: (view) => {
    const stage = (
      view as unknown as {
        stage?: {
          accuse?: { accused: string[]; spot: number } | null;
          last?: { guessers: string[] } | null;
        };
      }
    ).stage;
    if (view.phaseId === 'accuse') {
      const id = stage?.accuse?.accused[stage.accuse.spot];
      return id ? [id] : [];
    }
    if (view.phaseId === 'lastChance') return stage?.last?.guessers ?? [];
    return [];
  },
};
