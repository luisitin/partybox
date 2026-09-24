// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const clientModule: GameClientModule = {
  id: 'hive-rank',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // `rank` keeps the shell's `phase` chime ("pick up your phone"); the reveal says "look at the
  // TV"; the TV plays a `card` per spot itself (TvHive), so re-arming the step stays quiet.
  sounds: { intro: 'silence', hive: 'reveal', score: 'tally' },
  beds: { intro: 'lofi', rank: 'lofi', hive: 'latenight', score: 'warm' },
  // The reveal's own entrance is the choreography (the ladder and "The hive has decided…").
  quickInto: ['hive'],
  // The strip never leads the stage: no running scores while the hive counts down.
  stripScores: (view) => view.phaseId !== 'hive',
  // Ring the round's Queen Bee(s) during `score`.
  stripActive: (view) => {
    if (view.phaseId !== 'score') return [];
    const score = (view as { score?: { queens?: string[] } | null }).score;
    return score?.queens ?? [];
  },
  // Phone-only rooms: the hive's ladder on every phone. `intro` and `score` stay the Controller,
  // which draws the room's board itself there and keeps the VIP's Next button (PhoneStage has
  // no `skip`) — NOTES.md.
  PhoneStage: lazy(() =>
    import('./PhoneStage').then((m) => ({ default: m.PhoneStage })),
  ) as unknown as GameClientModule['PhoneStage'],
  phoneStagePhases: ['hive'],
};
