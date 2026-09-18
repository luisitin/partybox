// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';

export const clientModule: GameClientModule = {
  id: 'bingo',
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // Both phases cue themselves once the claimed card has landed (a cheer or the buzzer, Tv.tsx):
  // nothing on entry.
  // The final board is a scores moment (the drumroll); the results fanfare follows it.
  sounds: { bingo: 'silence', check: 'silence', final: 'tally' },
  // The ball dropping out of the cage is the entrance into play: cut, don't dissolve (loop 296).
  quickInto: ['play'],
  // Owner pick: "Wallpaper" with the occasional "Cool Vibes", quiet under the caller, back to back.
  music: { tracks: ['wallpaper', 'cool-vibes'], weights: [3, 1], volume: 0.2, mode: 'chain' },
};
