// Phase "bingo": the round is over — or is it. With a winner, their green card is the celebration,
// the win is recorded on entry, and the phase then waits (up to BINGO_DECIDE_MS) for the VIP's
// choice: keep going on the same cards for the same pattern (the winner sits it out) or for a
// blackout, or move on. With no winner (deck empty, VIP skipped through 75 calls) the TV says so
// for BINGO_MS. The deadline and VIP skip exit via `next` (scoreboard, or done after the last
// round); `continue` resumes calling via `resume`.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { BINGO_DECIDE_MS, BINGO_MS, DECK } from '../types';
import type { Claim, Input, State, Transition } from '../types';

export interface BingoExits {
  next: Transition;
  /** Back into `play`: the next number on the same deck. */
  resume: Transition;
}

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
  const settled =
    winnerId && !state.round.settled.includes(winnerId)
      ? [...state.round.settled, winnerId]
      : state.round.settled;
  return enterPhase(
    { ...state, wins, history, round: { ...state.round, winnerId, claim, settled } },
    'bingo',
    now,
    winnerId ? BINGO_DECIDE_MS : BINGO_MS,
  );
}

/** Whether the round can go on: a winner, numbers left, and (for a blackout) not one already. */
export function canContinue(state: State): { same: boolean; blackout: boolean } {
  const round = state.round;
  const more = round.winnerId !== null && round.drawn < DECK;
  return { same: more, blackout: more && round.pattern !== 'blackout' };
}

export function reduceBingo(state: State, event: GameEvent<Input>, exits: BingoExits): State {
  if (isTimerFor(state, event)) return exits.next(state, event.now);
  if (event.type !== 'input') return state;
  if (!hasPlayer(state, event.playerId) || !Object.hasOwn(state.round.cards, event.playerId))
    return state;
  if (event.input.type === 'next') return exits.next(state, event.now);
  if (event.input.type !== 'continue') return state;
  const can = canContinue(state);
  const blackout = event.input.pattern === 'blackout' && can.blackout;
  if (!can.same && !blackout) return state;
  const round = state.round;
  return exits.resume(
    {
      ...state,
      round: {
        ...round,
        // A new pattern reopens the round for everyone; the same one keeps its winners settled.
        pattern: blackout ? 'blackout' : round.pattern,
        settled: blackout ? [] : round.settled,
        claim: null,
        waitForCall: {},
      },
    },
    event.now,
  );
}
