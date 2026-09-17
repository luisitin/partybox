// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';

export const clientModule: GameClientModule = {
  id: 'bingo',
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // Both phases cue themselves once the claimed card has landed (a cheer or the buzzer, Tv.tsx):
  // nothing on entry.
  sounds: { bingo: 'silence', check: 'silence' },
  // Owner pick: "Wallpaper" with the occasional "Cool Vibes", quiet under the caller, back to back.
  music: { tracks: ['wallpaper', 'cool-vibes'], weights: [3, 1], volume: 0.2, mode: 'chain' },
};
