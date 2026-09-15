// Optional hints for the shared contract suite (packages/game-sdk/src/contract-tests).
// hiddenFromTv: strings that must not appear in tvView(state) — here, answers before the reveal.
// hiddenFromController: strings other players must never see on their phone.
import type { GameStateBase } from '@partybox/game-sdk';
import type { State } from '../server/types';

export const contractConfig = {
  hiddenFromTv: (state: GameStateBase): string[] =>
    state.phase.id === 'answer' ? Object.values((state as State).answers) : [],
  // Other players' answers — except one identical to my own, which I legitimately see.
  hiddenFromController: (state: GameStateBase, playerId: string): string[] => {
    const answers = (state as State).answers;
    return Object.entries(answers)
      .filter(([id, text]) => id !== playerId && text !== answers[playerId])
      .map(([, text]) => text);
  },
  settingsVariants: [{ answerSeconds: 10 }],
};
