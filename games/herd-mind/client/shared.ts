// What Herd Mind's phone and TV entries both carry (ADR-050): the words and the sound plan.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'herd-mind',
  strings: STRINGS,
  // SPEC §2.4: `phase` (pick up your phone) for each question. `herd` and `score` play their own
  // cues (TvHerd: the tally as the cards take off, then a cheer or a bust; TvScore: the sweep):
  // the shell re-chimes a mapped phase whenever its deadline moves, and both re-time (the voice,
  // the settings hold), so they map to `silence`.
  sounds: { herd: 'silence', score: 'silence' },
  beds: { intro: 'bossa', answer: 'bossa', herd: 'bossa', score: 'warm' },
};
