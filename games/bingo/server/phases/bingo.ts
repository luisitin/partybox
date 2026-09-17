// Phase "bingo" (10 s): a card has won — the green card is the celebration, the win is recorded and
// the card locked on entry. With `winners` bingos still to come (and numbers left) the caller then
// carries on with the same pattern; otherwise the round is over. With no winner (deck empty, VIP
// skipped through 75 calls) the TV says so. Exits on the deadline via `next`.
import { enterPhase, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { BINGO_MS, DECK } from '../types';
import type { Claim, Input, State, Transition } from '../types';

export function enterBingo(
  state: State,
  now: number,
  winnerId: string | null,
  claim: Claim | null,
): State {
  const round = state.round;
  const wins = winnerId
    ? { ...state.wins, [winnerId]: (state.wins[winnerId] ?? 0) + 1 }
    : state.wins;
  const won =
    winnerId && claim
      ? { ...round.won, [winnerId]: [...(round.won[winnerId] ?? []), claim.cardIndex] }
      : round.won;
  const winnerIds = winnerId ? [...round.winnerIds, winnerId] : round.winnerIds;
  return enterPhase(
    { ...state, wins, round: { ...round, winnerId, claim, won, winnerIds } },
    'bingo',
    now,
    BINGO_MS,
  );
}

/** Cards of `playerId` that have not won this round (the ones BINGO! may still check). */
export function liveCards(state: State, playerId: string): number[] {
  const locked = new Set(state.round.won[playerId] ?? []);
  return (state.round.cards[playerId] ?? []).map((_, i) => i).filter((i) => !locked.has(i));
}

/** After a bingo: does the caller carry on? Needs bingos to come, numbers left and a live card. */
export function roundContinues(state: State): boolean {
  const round = state.round;
  return (
    round.winnerId !== null &&
    round.winnerIds.length < state.settings.winners &&
    round.drawn < DECK &&
    Object.keys(round.cards).some((id) => liveCards(state, id).length > 0)
  );
}

export function reduceBingo(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  return state;
}
