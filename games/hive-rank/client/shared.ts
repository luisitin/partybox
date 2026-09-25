// What Hive Rank's phone and TV entries both carry (ADR-050): the words and the sound plan.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'hive-rank',
  strings: STRINGS,
  // `rank` keeps the shell's `phase` chime ("pick up your phone"). `hive` re-arms its deadline
  // every step, and the shell re-chimes a mapped cue on each: so it maps to `silence` and TvHive
  // plays its own `reveal` on entry and `card` (or `jackpot`) as each spot lands.
  sounds: { intro: 'silence', hive: 'silence', score: 'tally' },
  beds: { intro: 'lofi', rank: 'lofi', hive: 'latenight', score: 'warm' },
};
