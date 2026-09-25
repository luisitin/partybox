// The example box the rules teach with (not from the packs: the client never imports content).
import type { OptionView } from '../server/views';

export const SAMPLE_BOX = { icon: '🏴‍☠️', name: "Pirate's Chest" };
export const SAMPLE_OPTIONS: OptionView[] = [
  { kind: 'treasure', tier: 'LIKELY', chance: 60, pay: 1.5 },
  { kind: 'jackpot', tier: 'MAYBE', chance: 30, pay: 3 },
  { kind: 'trap', tier: 'RARE', chance: 10, pay: 9 },
];
