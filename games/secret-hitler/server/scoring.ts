// Results (SPEC §18.1): the winning side scores 1, everyone else 0; the side includes its dead
// members (Fascists = every Fascist plus Hitler). A game the VIP ended has no winner: all 0.
// Awards (§18.2) arrive with the finale in M4. ADR-052: the results say which side won and why
// (the shell's line is the headline, translated through the game's strings).
import { buildResults } from '@partybox/game-sdk';
import type { GameResults } from '@partybox/game-sdk';
import { partyOf } from './rules';
import type { State, WinReason } from './types';

export function scores(state: State): Record<string, number> {
  const out: Record<string, number> = {};
  const side = state.winner === 'liberals' ? 'L' : state.winner === 'fascists' ? 'F' : null;
  for (const id of Object.keys(state.players)) {
    const role = state.role[id];
    out[id] = side !== null && role !== undefined && partyOf(role) === side ? 1 : 0;
  }
  return out;
}

/** The results line by how it ended (English; client/strings.ts has the Spanish). */
const HEADLINE: Record<Exclude<WinReason, 'tooFew'>, string> = {
  liberalPolicies: 'Five Liberal laws: the Liberals win!',
  hitlerExecuted: 'Hitler is dead: the Liberals win!',
  hitlerFled: 'Hitler fled: the Liberals win!',
  fascistPolicies: 'Six Fascist laws: the Fascists win!',
  hitlerElected: 'Hitler is Chancellor: the Fascists win!',
};

function headline(state: State): string {
  const reason = state.winReason;
  if (reason === null) return 'The game was ended';
  if (reason !== 'tooFew') return HEADLINE[reason];
  return state.winner === 'liberals'
    ? 'Too few left: the Liberals win!'
    : 'Too few left: the Fascists win!';
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  const members = (side: 'L' | 'F'): string[] =>
    Object.keys(state.players).filter((id) => {
      const role = state.role[id];
      return role !== undefined && partyOf(role) === side;
    });
  return {
    ...buildResults(state, scores(state)),
    outcome: {
      kind: 'teams',
      winner: state.winner,
      teams: [
        { id: 'liberals', name: 'Liberals', mark: '▲', members: members('L') },
        { id: 'fascists', name: 'Fascists', mark: '●', members: members('F') },
      ],
    },
    headline: headline(state),
  };
}
