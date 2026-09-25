// What Fake-Out's phone and TV entries both carry (ADR-050): the sound plan and the words.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'fake-out',
  strings: STRINGS,
  // Look-at-the-TV moments get their own cues; `lie` and `pick` keep the shell's `phase` chime
  // ("pick up your phone"). The question and the reveal re-time their deadline (the voice, each
  // reveal step), and a mapped phase whose deadline moves chimes again — so they map to silence
  // and the stage plays `card`, `reveal`, `bust` and `jackpot` itself, each on its own frame.
  sounds: { question: 'silence', reveal: 'silence', scores: 'tally' },
  beds: { lie: 'marimba', pick: 'pulse', scores: 'warm' },
};
