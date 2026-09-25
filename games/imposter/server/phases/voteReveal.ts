// Phase "voteReveal": voters' faces land on their targets and the counts appear (about 4 s). The
// accusation is decided on entry (SPEC §1.6): the main vote may leave a runoff pending; a runoff's
// tie leaves its slot empty.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { decide, decideRunoff } from '../tally';
import { VOTE_REVEAL_MS } from '../types';
import type { Input, State, Transition } from '../types';

export function enterVoteReveal(state: State, now: number, showing: 'main' | 'runoff'): State {
  const r = state.round;
  let round = { ...r, showing };
  if (showing === 'main') {
    const d = decide(r.votes, Math.max(1, r.imposters.length), state.seats);
    round = {
      ...round,
      accused: d.accused,
      runoff: d.runoff
        ? { candidates: d.runoff.candidates, slots: d.runoff.slots, votes: {} }
        : null,
    };
  } else if (r.runoff) {
    const won = decideRunoff(r.runoff.votes, r.runoff.candidates, r.runoff.slots);
    const accused = state.seats.filter((id) => r.accused.includes(id) || won.includes(id));
    round = { ...round, accused };
  }
  return enterPhase({ ...state, round }, 'voteReveal', now, VOTE_REVEAL_MS);
}

/** True when the main vote's reveal leaves a runoff still to play. */
export function runoffPending(state: State): boolean {
  return state.round.showing === 'main' && state.round.runoff !== null;
}

export function reduceVoteReveal(state: State, event: GameEvent<Input>, next: Transition): State {
  return isTimerFor(state, event) ? next(state, event.now) : state;
}
