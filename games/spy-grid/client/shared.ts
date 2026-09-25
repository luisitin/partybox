// What Spy Grid's phone and TV entries both carry (ADR-050): the words and the sound plan.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'spy-grid',
  strings: STRINGS,
  // SPEC §9.4 sound column. The board phases cue themselves on their frames (client/moments.ts:
  // `phase` only when a turn's guessing opens, the flip's reveal and sting, the fanfare), so the
  // shell's per-phase chime stays out of their way; the turn's end sweeps (moments.ts too).
  sounds: {
    clue: 'silence',
    guess: 'silence',
    flip: 'silence',
    'turn-end': 'silence',
    win: 'silence',
  },
  // Beds (ADR-032): the lounge while teams form, held late-night chords while a spymaster
  // thinks, the quiz-show pulse while a team guesses and through its flips; the result is silent.
  beds: {
    teams: 'lounge',
    clue: 'latenight',
    guess: 'pulse',
    flip: 'pulse',
    'turn-end': 'latenight',
  },
};
