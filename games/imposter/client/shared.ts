// What Imposter's phone and TV entries both carry (ADR-050): the words and the sound plan.
import type { GameShared } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export const shared: GameShared = {
  id: 'imposter',
  strings: STRINGS,
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
};
