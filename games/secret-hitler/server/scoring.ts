// Results (SPEC §18.1): the winning side scores 1, everyone else 0; the side includes its dead
// members (Fascists = every Fascist plus Hitler). A game the VIP ended has no winner: all 0.
// Awards (§18.2) arrive with the finale in M4.
import { buildResults } from '@partybox/game-sdk';
import type { GameResults } from '@partybox/game-sdk';
import { partyOf } from './rules';
import type { State } from './types';

export function scores(state: State): Record<string, number> {
  const out: Record<string, number> = {};
  const side = state.winner === 'liberals' ? 'L' : state.winner === 'fascists' ? 'F' : null;
  for (const id of Object.keys(state.players)) {
    const role = state.role[id];
    out[id] = side !== null && role !== undefined && partyOf(role) === side ? 1 : 0;
  }
  return out;
}

export function results(state: State): GameResults | null {
  if (state.phase.id !== 'done') return null;
  return buildResults(state, scores(state));
}
