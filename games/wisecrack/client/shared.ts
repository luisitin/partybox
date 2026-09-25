// What Wisecrack's phone and TV entries both carry (ADR-050): the sound plan and the words.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'wisecrack',
  strings: STRINGS,
  sounds: { reveal: 'reveal', scores: 'tally' },
  // Background music (owner request 2026-09-18, like the lobby / Bingo / Blanks): playful comic
  // tracks while everyone writes (the long phase, a real tune suits it — chained, quiet), and the
  // synthesized beds around it. Intro: the warm groove. Vote and reveal share one bed per prompt
  // (the same list, so the bed carries on across the vote → reveal cut instead of crossfading
  // every six seconds) and alternate marimba / lo-fi prompt by prompt. Scores: the lounge swing.
  // `done` and the results stay silent under the fanfare.
  music: {
    tracks: ['sneaky-snitch', 'fluffing-a-duck', 'carefree'],
    volume: 0.2,
    mode: 'chain',
    phases: ['answer'],
  },
  beds: {
    intro: 'warm',
    vote: ['marimba', 'lofi'],
    reveal: ['marimba', 'lofi'],
    scores: 'lounge',
  },
};
