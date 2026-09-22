// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';

export const clientModule: GameClientModule = {
  id: 'bingo',
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // S-003: the card style and Motion, set up in the lobby.
  PhoneSettings: lazy(() => import('./PhonePanel').then((m) => ({ default: m.PhonePanel }))),
  // S-005: in a phone-only room the check and the win are shown on every phone.
  PhoneStage: lazy(() =>
    import('./PhoneStage').then((m) => ({ default: m.PhoneStage })),
  ) as unknown as GameClientModule['PhoneStage'],
  phoneStagePhases: ['check'], // the win keeps the phone's own screen (the Next-round choice lives there)
  // Both phases cue themselves once the claimed card has landed (a cheer or the buzzer, Tv.tsx):
  // nothing on entry.
  // The final board is a scores moment (the drumroll); the results fanfare follows it.
  // `phase` is "your phone needs you"; between rounds nothing does, so the board gets the points
  // sound (loop 323). The next intro keeps `phase`: the deal wants the hand.
  sounds: { bingo: 'silence', check: 'silence', scoreboard: 'tally', final: 'tally' },
  stageBottomBusy: ['check', 'bingo'], // I-116 B: the card on the TV reaches the foot of the stage
  // R2-01 A: whoever is one square from the pattern is ringed in the strip while it is true.
  stripActive: (view) => (view as { closeIds?: string[] }).closeIds ?? [],
  // The ball dropping out of the cage is the entrance into play: cut, don't dissolve (loop 296).
  quickInto: ['play'],
  // Owner pick: "Wallpaper" with the occasional "Cool Vibes", quiet under the caller, back to back.
  music: { tracks: ['wallpaper', 'cool-vibes'], weights: [3, 1], volume: 0.2, mode: 'chain' },
};
