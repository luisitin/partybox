// Phase "bingo": the round is over — or is it. With a winner, their green card is the celebration,
// the win is recorded and that card locked on entry, and the phase then waits for any player's
// choice: keep going on the same cards for the same pattern (the card that won sits it out; the
// winner's other cards play on) or for a blackout, or move on — unpaced, save a long safety valve
// for abandoned rooms (BINGO_ABANDONED_MS). A choice that arrives while the TV is still revealing
// the card is held (`round.decision`) and applied when the celebration ends. With no winner (deck
// empty, VIP skipped through 75 calls) the TV says so for BINGO_MS. `next` and the VIP skip exit
// (scoreboard, or done after the last round); `continue` resumes calling via `resume`, which
// repeats the number that was up.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { clearClaims, setMenu } from '../claims';
import { AUTO_END_MS, VERDICT_READ_MS, claimRevealMs } from '../reveal';
import { pointsFor } from '../scoring';
import { BINGO_ABANDONED_MS, BINGO_MS, DECK } from '../types';
import type { Claim, Decision, Input, State, Transition } from '../types';

export interface BingoExits {
  next: Transition;
  /** Back into `play` on the same number (the call repeats). */
  resume: Transition;
}

export function enterBingo(
  state: State,
  now: number,
  winnerId: string | null,
  claim: Claim | null,
): State {
  const round = state.round;
  const bingos = winnerId ? round.bingos + 1 : round.bingos;
  const patternBingos = winnerId ? round.patternBingos + 1 : round.patternBingos;
  // 3, 2, 1, then ½ under a pattern; a blackout starts the ladder again (scoring.ts).
  const wins = winnerId
    ? { ...state.wins, [winnerId]: (state.wins[winnerId] ?? 0) + pointsFor(patternBingos) }
    : state.wins;
  const history = [...state.history, { round: round.number, winnerId, calls: round.drawn }];
  const won =
    winnerId && claim
      ? { ...round.won, [winnerId]: [...(round.won[winnerId] ?? []), claim.cardIndex] }
      : round.won;
  const next = clearClaims({
    ...state,
    wins,
    history,
    round: { ...round, winnerId, claim, won, bingos, patternBingos, decision: null },
  });
  // Nothing left to play for (every card full, or no contest left): the round ends by itself
  // once the verdict has been read — the phones need not tap anything.
  const can = canContinue(next);
  const ms = !winnerId
    ? BINGO_MS
    : can.same || can.blackout || !claim
      ? BINGO_ABANDONED_MS
      : claimRevealMs(claim.cells, claim.daubs) + VERDICT_READ_MS + AUTO_END_MS;
  return enterPhase(next, 'bingo', now, ms);
}

/** Cards of `playerId` that have not won the current pattern (the ones BINGO! may still check). */
export function liveCards(state: State, playerId: string): number[] {
  const locked = new Set(state.round.won[playerId] ?? []);
  return (state.round.cards[playerId] ?? []).map((_, i) => i).filter((i) => !locked.has(i));
}

/**
 * Whether the round can go on. Same pattern: a winner, numbers left, and a contest — at least
 * two players (or everyone, in a two-player game) still hold a card that has not won it, and
 * nobody has blacked out every card they hold. Blackout: a winner, numbers left, and not that
 * pattern already.
 */
export function canContinue(state: State): { same: boolean; blackout: boolean } {
  const round = state.round;
  const more = round.winnerId !== null && round.drawn < DECK;
  const ids = Object.keys(round.cards).filter((id) => (round.cards[id]?.length ?? 0) > 0);
  const competing = ids.filter((id) => liveCards(state, id).length > 0).length;
  const contest = competing >= Math.min(2, ids.length);
  const blackedOut =
    round.pattern === 'blackout' && ids.some((id) => liveCards(state, id).length === 0);
  return { same: more && contest && !blackedOut, blackout: more && round.pattern !== 'blackout' };
}

/** The room's choice, once the celebration is done. */
function decide(state: State, decision: Decision, now: number, exits: BingoExits): State {
  if (decision.type === 'next') return exits.next(state, now);
  const round = state.round;
  const blackout = decision.pattern === 'blackout';
  return exits.resume(
    {
      ...state,
      round: {
        ...round,
        // A new pattern reopens the round for every card; the same one keeps its winners locked.
        pattern: blackout ? 'blackout' : round.pattern,
        won: blackout ? {} : round.won,
        patternBingos: blackout ? 0 : round.patternBingos,
        decision: null,
        claim: null,
        waitForCall: {},
      },
    },
    now,
  );
}

/** When the room has seen the verdict: the TV's reveal of this claim, then a moment to read it. */
function celebrationEndsAt(state: State): number {
  const claim = state.round.claim;
  if (!claim) return 0;
  return state.phase.startedAt + claimRevealMs(claim.cells, claim.daubs) + VERDICT_READ_MS;
}

export function reduceBingo(state: State, event: GameEvent<Input>, exits: BingoExits): State {
  if (isTimerFor(state, event)) {
    const held = state.round.decision;
    return held ? decide(state, held, event.now, exits) : exits.next(state, event.now);
  }
  if (event.type !== 'input') return state;
  if (!hasPlayer(state, event.playerId) || !Object.hasOwn(state.round.cards, event.playerId))
    return state;
  const input = event.input;
  if (input.type === 'menu') return setMenu(state, event.playerId, input.open);
  if (input.type !== 'next' && input.type !== 'continue') return state;
  if (input.type === 'continue') {
    const can = canContinue(state);
    if (!(input.pattern === 'blackout' ? can.blackout : can.same)) return state;
  }
  if (state.round.decision) return state; // the first choice counts
  const endsAt = celebrationEndsAt(state);
  if (event.now >= endsAt) return decide(state, input, event.now, exits);
  // Mid-celebration: hold it, and bring the deadline forward to the end of the reveal.
  return {
    ...state,
    round: { ...state.round, decision: input },
    phase: { ...state.phase, deadline: endsAt },
  };
}
