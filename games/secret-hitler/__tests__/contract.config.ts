// Declared secrets for the shared contract suite (SPEC §11). Roles are words the views only carry
// in a dossier (own), a Fascist's team list, or the end reveal; session cards only in the
// chooser's `act`. Per-player role leaks are pinned by __tests__/leaks.test.ts with ids.
import type { GameStateBase } from '@partybox/game-sdk';
import { chooserOf } from '../server/flow';
import type { State } from '../server/types';

const OVER = new Set(['gameOver', 'done']);

export const contractConfig = {
  hiddenFromTv: (state: GameStateBase): string[] => {
    const s = state as State;
    const secret = ['dossier', 'intel', '"cards":["'];
    // Before a winner is known no role or party word reaches the TV ("hitler" is in the game id).
    return s.winner === null && !OVER.has(s.phase.id) ? [...secret, 'liberal', 'fascist'] : secret;
  },
  hiddenFromController: (state: GameStateBase, viewer: string): string[] => {
    const s = state as State;
    const out: string[] = [];
    const chooser = chooserOf(s) === viewer;
    if (!chooser) out.push('"cards":["');
    if (s.winner === null && !OVER.has(s.phase.id) && s.role[viewer] === 'liberal')
      out.push('fascist');
    return out;
  },
  settingsVariants: [{ pace: 'relaxed' }, { pace: 'fast' }],
};
