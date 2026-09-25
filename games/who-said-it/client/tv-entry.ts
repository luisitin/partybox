// Who Said It's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import { shared } from './shared';
import { Tv } from './Tv';

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // The reveal's own entrance is the choreography: the TV cuts into it (the card rises).
  quickInto: ['reveal'],
  // The reveal draws every face and name itself: the strip steps aside (a faces-only strip read as
  // broken to play-testers), so 16 players fit too.
  stripHidden: ['reveal'],
  // The flip applies points beat by beat: the strip never leads the stage.
  stripScores: (view) => view.phaseId !== 'guess' && view.phaseId !== 'reveal',
  // The author, rung on the strip at the flip.
  stripActive: (view) => {
    const reveal = (view as { reveal?: { step: string; authors: string[] } | null }).reveal;
    return reveal?.step === 'shown' ? reveal.authors : [];
  },
};
