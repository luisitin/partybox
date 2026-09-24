// What Blanks' phone and TV entries both carry (ADR-050): the sound plan and the words.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'blanks',
  strings: STRINGS,
  // Every reveal step is its own phase instance: one soft 'card' pluck per card read out (the
  // owner's pick over the fuller 'reveal', which was too much three cards in a row).
  // The final board is a scores moment too; the results fanfare follows it.
  // The pick is the judge's moment: the phone chime says so (unmapped = 'phase').
  sounds: { reveal: 'card', result: 'tally', final: 'tally' },
  // Blanks had no music at all (the owner, 2026-09-21: "Blanks has no music or sounds on phone"):
  // a sly lounge set. The owner, 2026-09-23: "the background music seems to change between
  // picking, reading, judging — keep it all the same so it does not feel like sharply changing,
  // and lower the volume since it is background": one chain of tracks carries on from the round
  // card through the result (the same plan, so a phase change never restarts it), at 0.12 (was
  // 0.2), and the per-phase synthesized beds that swapped under it are gone. The final board keeps
  // its fanfare to itself. Later that day: "still a bit loud — music quietly in the background the
  // whole time": 0.07, and the reader no longer dips it (useReading's clip asks for no duck).
  music: {
    tracks: ['local-forecast-elevator', 'george-street-shuffle', 'bossa-antigua'],
    volume: 0.07,
    mode: 'chain',
    phases: ['intro', 'pick', 'answer', 'reveal', 'judge', 'result'],
  },
};
