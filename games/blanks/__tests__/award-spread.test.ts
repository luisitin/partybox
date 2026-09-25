// I-474: the awards don't all go to the night's leader.
import { describe, expect, it } from 'vitest';
import { awardsFor } from '../server/scoring';
import type { State } from '../server/types';

// Priya leads: 5 votes to Sam's 4, fast cards 3–3, the night's best card, the top score.
const state = {
  players: {
    priya: { id: 'priya', name: 'Priya' },
    sam: { id: 'sam', name: 'Sam' },
  },
  scores: { priya: 5, sam: 4 },
  settings: { judge: 'vote', timed: true, answerSeconds: 60 },
  stats: {
    votesReceived: { priya: 5, sam: 4 },
    fastPlays: { priya: 3, sam: 3 },
    best: null,
    streak: null,
    bestRun: null,
    roundVotes: {},
  },
} as unknown as State;

const who = (s: State) => Object.fromEntries(awardsFor(s).map((a) => [a.id, a.playerId]));

describe('I-474: awards spread', () => {
  it('a tied stat goes to the one without an award (Priya already has Crowd favourite)', () => {
    expect(who(state)['crowd-favourite']).toBe('priya');
    expect(who(state)['quick-draw']).toBe('sam');
  });
  it('an outright best still wins', () => {
    const close = { ...state, stats: { ...state.stats, fastPlays: { priya: 5, sam: 4 } } } as State;
    expect(who(close)['quick-draw']).toBe('priya');
  });
});
