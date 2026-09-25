// Vote checking shared by `vote` and `runoff` (SPEC §1.7 "Ignored silently"): never self, no
// repeats, only known candidates, exactly the right count. A resend replaces the earlier vote.
import { hasPlayer } from '@partybox/game-sdk';
import { activeSeats } from './round';
import type { State } from './types';

/** Who `voter` may pick from right now, and how many picks a vote needs. */
export function ballot(state: State, voter: string): { candidates: string[]; picks: number } {
  const r = state.round;
  if (state.phase.id === 'runoff' && r.runoff)
    return {
      candidates: r.runoff.candidates.filter((id) => id !== voter),
      picks: r.runoff.slots,
    };
  return {
    candidates: activeSeats(state).filter((id) => id !== voter),
    picks: Math.max(1, r.imposters.length),
  };
}

/** The cleaned targets, or null when the vote must be ignored. */
export function validVote(
  state: State,
  voter: string,
  targets: readonly string[],
): string[] | null {
  if (!hasPlayer(state, voter) || !activeSeats(state).includes(voter)) return null;
  const { candidates, picks } = ballot(state, voter);
  if (candidates.length < picks) return null;
  if (targets.length !== picks || new Set(targets).size !== targets.length) return null;
  if (!targets.every((t) => candidates.includes(t))) return null;
  return [...targets];
}

/** Voters who could cast a vote in this phase (a runoff candidate with too few others can't). */
export function eligibleVoters(state: State): string[] {
  return activeSeats(state).filter((id) => {
    const b = ballot(state, id);
    return b.candidates.length >= b.picks;
  });
}
