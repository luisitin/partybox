// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import type { SpyTvView } from '../server/views';
import { STRINGS } from './strings';

const BOARD = ['clue', 'guess', 'flip', 'turn-end', 'win'] as const;

export const clientModule: GameClientModule = {
  id: 'spy-grid',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  PhoneStage: lazy(() => import('./PhoneStage').then((m) => ({ default: m.PhoneStage }))),
  phoneStagePhases: ['flip', 'turn-end', 'win'],
  PhoneSettings: lazy(() => import('./PhonePanel').then((m) => ({ default: m.PhonePanel }))),
  // SPEC §9.4 sound column. The board phases cue themselves on their frames (client/moments.ts:
  // `phase` only when a turn's guessing opens, the flip's reveal and sting, the fanfare), so the
  // shell's per-phase chime stays out of their way; the turn's end sweeps (moments.ts too).
  sounds: {
    clue: 'silence',
    guess: 'silence',
    flip: 'silence',
    'turn-end': 'silence',
    win: 'silence',
  },
  // Beds (ADR-032): the lounge while teams form, held late-night chords while a spymaster
  // thinks, the quiz-show pulse while a team guesses and through its flips; the result is silent.
  beds: {
    teams: 'lounge',
    clue: 'latenight',
    guess: 'pulse',
    flip: 'pulse',
    'turn-end': 'latenight',
  },
  // The board keeps its place from phase to phase: no rise, a quick ghost (identical boards
  // cross-fading read as still), each phase's own entrance is the motion.
  quickInto: BOARD,
  // The TeamBanners show the players; the board needs the room (SPEC §9.4 client hooks).
  stripHidden: ['clue', 'guess', 'flip', 'turn-end', 'win'],
  stripActive: (view) => {
    const v = view as unknown as SpyTvView;
    if (v.phaseId === 'clue') {
      const spy = v.spymaster?.[v.turnTeam];
      return spy ? [spy] : [];
    }
    if (v.phaseId === 'guess')
      return (v.teams?.[v.turnTeam] ?? []).filter((id) => id !== v.spymaster?.[v.turnTeam]);
    return [];
  },
};
