// What Echo's phone and TV entries both carry (ADR-050): the words and the sound plan.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'echo',
  strings: STRINGS,
  // §7.3: `phase` = pick up your phone (clue); `tally` = look at the TV. The guess and the result
  // cue themselves on their own beats: both step their deadline (the early-guess hold, That
  // counts), and the shell re-chimes a mapped cue on every step.
  sounds: { intro: 'start', check: 'tally', guess: 'silence', result: 'silence' },
  beds: { intro: 'lounge', clue: 'lofi', check: 'lofi', guess: 'pulse', result: 'lofi' },
};
