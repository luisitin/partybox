// What Tune In's phone and TV entries both carry (ADR-050): the words, the sound plan and the beds.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'tune-in',
  strings: STRINGS,
  // Spec §5.4: dial and call are "pick up your phone" (unmapped); the clue's `card` and the
  // reveal's cues are played by the stage itself on their own frames (`silence` here, so the
  // reading never swallows the card and a re-armed beat never chimes); scores tally.
  sounds: { clue: 'silence', reveal: 'silence', scores: 'tally' },
  beds: { intro: 'lounge', clue: 'latenight', dial: 'marimba', call: 'pulse', scores: 'warm' },
};
