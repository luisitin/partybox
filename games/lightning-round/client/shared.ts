// What Lightning Round's phone and TV entries both carry (ADR-050): the sound plan and the words.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'lightning-round',
  strings: STRINGS,
  sounds: { reveal: 'reveal', wager: 'wager' },
  // Background music (owner request 2026-09-18): the phases flip every 5–15 s, so synthesized beds
  // (ADR-032), never file tracks. The intro rolls in on the marimba; question and reveal share the
  // quiz-show `pulse` (one bed, so it carries straight through the reveal cut and back into the
  // next question — the reveal sting ducks it); the wager holds its breath on the late-night
  // chords; the final question is the pulse again. `done` and the results stay silent.
  beds: { intro: 'marimba', question: 'pulse', reveal: 'pulse', wager: 'latenight' },
};
