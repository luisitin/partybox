// Hints for the shared contract suite (packages/game-sdk/src/contract-tests). Bingo has no
// secrets: a card only reaches the TV when its owner claims, and the deck is public once drawn.
// The one thing a TV must never show is the deck AHEAD of the current call — numbers are ≤ 2
// characters so the suite's substring check cannot express that; games/bingo/__tests__ pins it.
import type { GameStateBase } from '@partybox/game-sdk';

export const contractConfig = {
  hiddenFromTv: (_state: GameStateBase): string[] => [],
  hiddenFromController: (_state: GameStateBase, _playerId: string): string[] => [],
  settingsVariants: [
    { rounds: 1, round1: 'blackout', callSeconds: 3 },
    { rounds: 2, round1: 'corners', round2: 'x', callSeconds: 4, spicy: true },
    { rounds: 1, showBoard: false, showPrevious: false },
  ],
};
