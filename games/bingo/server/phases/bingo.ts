// Phase "bingo": the round is over — or is it. With a winner, their green card is the celebration,
// the win is recorded and that card locked on entry, and the phase then waits for any player's
// choice: keep going on the same cards for the same pattern (the card that won sits it out; the
// winner's other cards play on) or for a blackout, or move on — unpaced, save a long safety valve
// for abandoned rooms (BINGO_ABANDONED_MS). With no winner (deck empty, VIP skipped through 75
// calls) the TV says so for BINGO_MS. The deadlines, `next` and the VIP skip exit (scoreboard, or
// done after the last round); `continue` resumes calling via `resume`.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { clearClaims, setMenu } from '../claims';
import { BINGO_ABANDONED_MS, BINGO_MS, DECK } from '../types';
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
  const round = state.round;
  const wins = winnerId
    ? { ...state.wins, [winnerId]: (state.wins[winnerId] ?? 0) + 1 }
    : state.wins;
  const history = [...state.history, { round: round.number, winnerId, calls: round.drawn }];
  const won =
    winnerId && claim
      ? { ...round.won, [winnerId]: [...(round.won[winnerId] ?? []), claim.cardIndex] }
      : round.won;
  const bingos = winnerId ? round.bingos + 1 : round.bingos;
  return enterPhase(
    clearClaims({ ...state, wins, history, round: { ...round, winnerId, claim, won, bingos } }),
    'bingo',
    now,
    winnerId ? BINGO_ABANDONED_MS : BINGO_MS,
  );
}

/** Cards of `playerId` that have not won the current pattern (the ones BINGO! may still check). */
export function liveCards(state: State, playerId: string): number[] {
  const locked = new Set(state.round.won[playerId] ?? []);
  return (state.round.cards[playerId] ?? []).map((_, i) => i).filter((i) => !locked.has(i));
}

/**
 * Whether the round can go on: a winner, numbers left, and — for the same pattern — a card in
 * the room that has not won it yet; for a blackout, not one already.
 */
export function canContinue(state: State): { same: boolean; blackout: boolean } {
  const round = state.round;
  const more = round.winnerId !== null && round.drawn < DECK;
  const anyLive = Object.keys(round.cards).some((id) => liveCards(state, id).length > 0);
  return { same: more && anyLive, blackout: more && round.pattern !== 'blackout' };
}

export function reduceBingo(state: State, event: GameEvent<Input>, exits: BingoExits): State {
  if (isTimerFor(state, event)) return exits.next(state, event.now);
  if (event.type !== 'input') return state;
  if (!hasPlayer(state, event.playerId) || !Object.hasOwn(state.round.cards, event.playerId))
    return state;
  if (event.input.type === 'next') return exits.next(state, event.now);
  if (event.input.type === 'menu') return setMenu(state, event.playerId, event.input.open);
  if (event.input.type !== 'continue') return state;
  const can = canContinue(state);
  const blackout = event.input.pattern === 'blackout' && can.blackout;
  if (!blackout && !(event.input.pattern === 'same' && can.same)) return state;
  const round = state.round;
  return exits.resume(
    {
      ...state,
      round: {
        ...round,
        // A new pattern reopens the round for every card; the same one keeps its winners locked.
        pattern: blackout ? 'blackout' : round.pattern,
        won: blackout ? {} : round.won,
        claim: null,
        waitForCall: {},
      },
    },
    event.now,
  );
}
