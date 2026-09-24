// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const clientModule: GameClientModule = {
  id: 'who-said-it',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  PhoneStage: lazy(() => import('./PhoneStage').then((m) => ({ default: m.PhoneStage }))),
  phoneStagePhases: ['intro', 'prompt', 'reveal', 'scores'],
  // SPEC §4.3: the prompt is a card on stage; write and guess are "pick up your phone" (the plain
  // phase chime); the reveal opens on the tally of taps landing (its flip plays reveal + cheer /
  // bust from the stage); the board is a tally.
  // Prompt and reveal move their own deadline (the prompt re-times to its reading; the reveal's
  // flip is a second beat, ADR-033), and the shell re-chimes a mapped cue whenever that happens
  // (TvApp 'reentered'): they map to silence and play their cue once per instance themselves.
  sounds: { intro: 'start', prompt: 'silence', reveal: 'silence', scores: 'tally' },
  // The reveal's own entrance is the choreography: the TV cuts into it (the taps start flying).
  quickInto: ['reveal'],
  // The reveal draws every face itself: the strip drops to faces only, so 16 players' board and
  // the name line fit under it (record-review p04: the name fell below the stage).
  stripCompact: ['reveal'],
  // The flip applies points beat by beat: the strip never leads the stage.
  stripScores: (view) => view.phaseId !== 'guess' && view.phaseId !== 'reveal',
  // The author, rung on the strip at the flip.
  stripActive: (view) => {
    const reveal = (view as { reveal?: { step: string; authors: string[] } | null }).reveal;
    return reveal?.step === 'shown' ? reveal.authors : [];
  },
  // One bed per stretch: warm for the titles, lo-fi under writing and the whole guess → reveal
  // loop (one continuous bed, never a crossfade every five seconds), warm again on the board.
  beds: { intro: 'warm', write: 'lofi', guess: 'lofi', reveal: 'lofi', scores: 'warm' },
};
