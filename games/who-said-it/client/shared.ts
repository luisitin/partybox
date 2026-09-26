// What Who Said It's phone and TV entries both carry (ADR-050): the words, the cues, the beds.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'who-said-it',
  strings: STRINGS,
  // SPEC §4.3. Prompt and reveal move their own deadline (the prompt re-times to its reading; the
  // reveal's flip is a second beat, ADR-033), and the shell re-chimes a mapped cue whenever that
  // happens: they map to silence and play their cue once per instance themselves.
  sounds: { prompt: 'silence', reveal: 'silence', scores: 'tally' },
  // One bed per stretch: warm for the titles, lo-fi under writing and the whole guess → reveal
  // loop (one continuous bed, never a crossfade every five seconds), warm again on the board.
  beds: { prompt: 'warm', write: 'lofi', guess: 'lofi', reveal: 'lofi', scores: 'warm' },
};
