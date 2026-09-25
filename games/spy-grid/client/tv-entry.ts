// Spy Grid's TV entry (ADR-050): downloaded by the TV once the game is chosen, never by a phone.
import type { GameTvModule } from '@partybox/game-sdk/ui';
import type { SpyTvView } from '../server/views';
import { shared } from './shared';
import { Tv } from './Tv';

const BOARD = ['clue', 'guess', 'flip', 'turn-end', 'win'] as const;

export const tv: GameTvModule = {
  ...shared,
  Tv,
  // The board keeps its place from phase to phase: no rise, a quick ghost (identical boards
  // cross-fading read as still), each phase's own entrance is the motion.
  quickInto: BOARD,
  // The TeamBanners show the players; the board needs the room (SPEC §9.4 client hooks).
  // `teams` too: its two columns list every player (16 chips in four rows pushed them off the stage).
  stripHidden: ['teams', 'clue', 'guess', 'flip', 'turn-end', 'win'],
  stripActive: (view) => {
    const v = view as unknown as SpyTvView;
    if (v.phaseId === 'clue') {
      const spy = v.spymaster?.[v.turnTeam];
      return spy ? [spy] : [];
    }
    if (v.phaseId === 'guess')
      return (v.teams?.[v.turnTeam] ?? []).filter((id) => id !== v.spymaster?.[v.turnTeam]);
    return [];
  },
};
