// Hints for the shared contract suite (packages/game-sdk/src/contract-tests). Nightfall's secrets
// are relations (who holds which role, who picked whom), which substring lists cannot express, so
// the real leak checks are the non-interference tests in leaks.test.ts and bot.test.ts. Here: the
// night reports other phones hold must never appear in this phone's view, and settings variants
// so every role, presence path and flavour gets played to the end.
import type { GameStateBase } from '@partybox/game-sdk';
import { game } from '../server/index';
import type { State } from '../server/types';

export const contractConfig = {
  hiddenFromTv: (state: GameStateBase): string[] => {
    const s = state as State;
    return s.seats.map((id) => game.controllerView(s, id).report).filter((r): r is string => !!r);
  },
  hiddenFromController: (state: GameStateBase, viewer: string): string[] => {
    const s = state as State;
    const mine = s.seats.includes(viewer) ? game.controllerView(s, viewer).report : null;
    return (
      s.seats
        .filter((id) => id !== viewer)
        .map((id) => game.controllerView(s, id).report)
        // "Your hunch: Player 1" sits inside my own "Your hunch: Player 10": not a leak.
        .filter((r): r is string => !!r && !(mine ?? '').includes(r))
    );
  },
  settingsVariants: [
    { roles: 'seer,doctor,hunter,jester', townBoard: 'on', reader: 'none' },
    { flavour: 'mafia', revealRoles: false, hunches: false, maxDays: 4 },
    { wolves: '1', ghostsSeeAll: true, nightSeconds: 30, daySeconds: 60, voteSeconds: 20 },
  ],
};
