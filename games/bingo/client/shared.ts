// What Bingo's phone and TV entries both carry (ADR-050): the sound plan and the words.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'bingo',
  strings: STRINGS,
  // Both phases cue themselves once the claimed card has landed (a cheer or the buzzer, Tv.tsx):
  // nothing on entry.
  // The final board is a scores moment (the drumroll); the results fanfare follows it.
  // `phase` is "your phone needs you"; between rounds nothing does, so the board gets the points
  // sound (loop 323). The next intro keeps `phase`: the deal wants the hand.
  sounds: { bingo: 'silence', check: 'silence', scoreboard: 'tally', final: 'tally' },
  // Owner pick: "Wallpaper" with the occasional "Cool Vibes", quiet under the caller, back to back.
  music: { tracks: ['wallpaper', 'cool-vibes'], weights: [3, 1], volume: 0.2, mode: 'chain' },
};
