// What the client registry imports (ADR-003). Surfaces are lazy so an unplayed game costs nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import type { FakeOutTvView } from '../server/index';
import { STRINGS } from './strings';

export const clientModule: GameClientModule = {
  id: 'fake-out',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  // Look-at-the-TV moments get their own cues; `lie` and `pick` keep the shell's `phase` chime
  // ("pick up your phone"). The question and the reveal re-time their deadline (the voice, each
  // reveal step), and a mapped phase whose deadline moves chimes again — so they map to silence
  // and the stage plays `card`, `reveal`, `bust` and `jackpot` itself, each on its own frame.
  sounds: { question: 'silence', reveal: 'silence', scores: 'tally' },
  beds: { intro: 'lounge', lie: 'marimba', pick: 'pulse', scores: 'warm' },
  // The question card's tip is its own entrance. The reveal crossfades in: its first frame is a
  // new composition (the grid folds into the deck), and a cut read as the grid jumping when the
  // clock column left the strip.
  quickInto: ['question'],
  stripCompact: ['pick', 'reveal'],
  // The reveal hands points out step by step: the strip's totals wait for the scoreboard.
  stripScores: (view) => view.phaseId !== 'reveal',
  // The players who picked the option on stage.
  stripActive: (view) => {
    const reveal = (view as unknown as FakeOutTvView).reveal;
    if (!reveal || reveal.kind !== 'option') return [];
    return reveal.shown[reveal.shown.length - 1]?.pickers ?? [];
  },
  PhoneStage: lazy(() => import('./PhoneStage').then((m) => ({ default: m.PhoneStage }))),
  phoneStagePhases: ['reveal'],
};
