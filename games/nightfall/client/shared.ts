// What Nightfall's phone and TV entries both carry (ADR-050): the words and the sound plan.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'nightfall',
  strings: STRINGS,
  // The roles phase re-times when the 3 · 2 · 1 starts, so its card cue is the scene's too.
  // SPEC §10.4: the plain `phase` chime means "pick up your phone" (night, vote); the reveals
  // sound like "look at the TV". The stepped phases (dawn, verdict, hunter, last words) move their
  // deadline on every step, and the shell re-chimes a mapped cue on each move — so they map to
  // `silence` and every one of their cues, the opening one included, is the scene's (useStepCue).
  sounds: {
    roles: 'silence',
    night: 'phase',
    dawn: 'silence',
    hunter: 'silence',
    day: 'start',
    vote: 'phase',
    runoff: 'phase',
    verdict: 'silence',
    'last-words': 'silence',
    end: 'fanfare',
  },
  // SPEC §10.15 beds: late-night chords under the roles and the night, lo-fi by day, the pulse
  // under votes and the hunter; the reveals and the end are silent so the narrator carries them.
  beds: {
    roles: 'latenight',
    night: 'latenight',
    day: 'lofi',
    vote: 'pulse',
    runoff: 'pulse',
    hunter: 'pulse',
  },
};
