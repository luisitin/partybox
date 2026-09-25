// What Blind Auction's phone and TV entries both carry (ADR-050): the words, the sound plan and the
// music.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'blind-auction',
  strings: STRINGS,
  // The game plays its own cues on the frame they belong to (TvTable, TvRules): the dealt box, the
  // `phase` chime under "Place your bets!", the reveal's cue as the box finishes turning, the 3·2·1.
  // Mapped phases re-chime whenever their deadline moves, so every phase maps to `silence`.
  sounds: {
    rules: 'silence',
    box: 'silence',
    bet: 'silence',
    swap: 'silence',
    potato: 'silence',
    tug: 'silence',
    open: 'silence',
  },
  // The owner (2026-09-24): the music never stops — one low, continuous caper playlist under the
  // whole game (no per-phase beds: a bed swapping every ten seconds read as choppy).
  music: {
    tracks: ['sneaky-snitch', 'hep-cats', 'george-street-shuffle'],
    weights: [3, 2, 2],
    volume: 0.18,
    mode: 'chain',
  },
};
