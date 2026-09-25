// Hints for the shared contract suite (packages/game-sdk/src/contract-tests). Its substring check
// can't express "the key", so it guards the words only a key could put in a view: nobody but a
// spymaster may read "assassin" (or "bystander") before one is shown to them. The full
// non-interference check (views identical under a re-dealt key) is leaks.test.ts.
import type { GameStateBase } from '@partybox/game-sdk';
import { roleOf } from '../server/teams';
import type { Kind, State } from '../server/types';

function unseen(s: State, kind: Kind, stage: 1 | 2): boolean {
  return !s.key.some((k, i) => k === kind && (s.flipped[i] ?? 0) >= stage);
}

export const contractConfig = {
  hiddenFromTv: (state: GameStateBase): string[] => {
    const s = state as State;
    return (['assassin', 'bystander'] as const).filter((k) => unseen(s, k, 1));
  },
  hiddenFromController: (state: GameStateBase, playerId: string): string[] => {
    const s = state as State;
    const role = roleOf(s, playerId);
    if (role === 'spymaster') return [];
    const stage = role === 'spectator' ? 1 : 2;
    return (['assassin', 'bystander'] as const).filter((k) => unseen(s, k, stage));
  },
  // Two variants keep the suite inside its 20 s per test at 16 players: co-op, and everything else
  // that changes the flow (random teams, two rounds, two assassins, spicy words, no reader).
  settingsVariants: [
    { mode: 'coop' },
    {
      teamPick: 'random',
      rounds: 2,
      assassins: '2',
      spicy: true,
      reactions: false,
      reader: 'none',
    },
  ],
};
