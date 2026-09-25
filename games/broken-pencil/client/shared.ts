// What Broken Pencil's phone and TV entries both carry (ADR-050): the sound plan and the words.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'broken-pencil',
  strings: STRINGS,
  // No points: the results headline says the show is over, and the summary stays up there.
  scoreless: true,
  // Every page of the show is its own phase instance and the shell chimes each one (review-loop
  // #93): the soft 'card' pluck turns a page; the full 'reveal' was too much twenty-five times.
  sounds: { show: 'card' },
  // Owner pick: lounge tracks, quiet, only while people draw and guess (never over the reveal).
  music: {
    tracks: ['backbay-lounge', 'lobby-time', 'hep-cats'],
    volume: 0.2,
    mode: 'chain',
    phases: ['draw', 'guess', 'pass'],
  },
};
