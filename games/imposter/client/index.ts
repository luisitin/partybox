// What the client registry imports (ADR-003). Components are lazy so unplayed games cost nothing.
import { lazy } from 'react';
import type { GameClientModule } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

/** Phases whose stage shows scores only after the word is out (SPEC §1.3 stripScores). */
const HIDDEN_SCORES = new Set([
  'clueReveal',
  'talk',
  'vote',
  'voteReveal',
  'runoff',
  'accuse',
  'lastChance',
  'wordReveal',
]);

export const clientModule: GameClientModule = {
  id: 'imposter',
  strings: STRINGS,
  Tv: lazy(() => import('./Tv').then((m) => ({ default: m.Tv }))),
  Controller: lazy(() => import('./Controller').then((m) => ({ default: m.Controller }))),
  PhoneStage: lazy(() =>
    import('./PhoneStage').then((m) => ({ default: m.PhoneStage })),
  ) as unknown as GameClientModule['PhoneStage'],
  // The paced reveals; intro, the word reveal and scores stage inside the Controller (VIP buttons).
  phoneStagePhases: ['clueReveal', 'voteReveal', 'accuse'],
  // `phase` (pick up your phone) stays on deal, clue, vote, runoff; the TV moments get theirs.
  sounds: {
    intro: 'start',
    deal: 'card',
    // Paced reveals step their deadline (ADR-033), and the shell re-chimes a mapped cue on every
    // step: these stay 'silence' and their scenes play 'reveal' once, on mount.
    clueReveal: 'silence',
    talk: 'sweep',
    voteReveal: 'tally',
    accuse: 'silence',
    lastChance: 'wager',
    wordReveal: 'silence',
    scores: 'tally',
  },
  beds: {
    intro: 'lounge',
    deal: 'lounge',
    clue: 'marimba',
    talk: 'latenight',
    vote: 'pulse',
    runoff: 'pulse',
    lastChance: 'pulse',
    scores: 'warm',
  },
  // The table stays put from the deal to the vote: each of these phases brings its own entrance.
  quickInto: [
    'deal',
    'clue',
    'clueReveal',
    'talk',
    'vote',
    'voteReveal',
    'runoff',
    'accuse',
    'wordReveal',
  ],
  stripScores: (view) => !HIDDEN_SCORES.has(view.phaseId),
  stripActive: (view) => {
    const stage = (
      view as unknown as {
        stage?: {
          accuse?: { accused: string[]; spot: number } | null;
          last?: { guessers: string[] } | null;
        };
      }
    ).stage;
    if (view.phaseId === 'accuse') {
      const id = stage?.accuse?.accused[stage.accuse.spot];
      return id ? [id] : [];
    }
    if (view.phaseId === 'lastChance') return stage?.last?.guessers ?? [];
    return [];
  },
};
