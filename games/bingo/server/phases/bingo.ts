// Phase "bingo" (10 s): the round is over. With a winner, their green card is the celebration and
// the win is recorded on entry; with none (deck empty, VIP skipped through 75 calls) the TV says
// so. Exits on the deadline via `next` (scoreboard, or done after the last round).
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { BINGO_MS } from '../types';
import type { Claim, Input, State, Transition } from '../types';

export function enterBingo(
  state: State,
  now: number,
  winnerId: string | null,
  claim: Claim | null,
): State {
  const wins = winnerId
    ? { ...state.wins, [winnerId]: (state.wins[winnerId] ?? 0) + 1 }
    : state.wins;
  const history = [
    ...state.history,
    { round: state.round.number, winnerId, calls: state.round.drawn },
  ];
  return enterPhase(
    { ...state, wins, history, round: { ...state.round, winnerId, claim } },
    'bingo',
    now,
    BINGO_MS,
  );
}

export function reduceBingo(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
