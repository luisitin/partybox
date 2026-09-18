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
  /** Back into `play` on the same number (the call repeats), naming who chose to. */
  resume: (state: State, now: number, by: string) => State;
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
  const history = [...state.history, { round: round.number, winnerId, calls: round.drawn }];
  const won =
    winnerId && claim
      ? { ...round.won, [winnerId]: [...(round.won[winnerId] ?? []), claim.cardIndex] }
      : round.won;
  const next = clearClaims({
    ...state,
    history,
    round: {
      ...round,
      winnerId,
      claim,
      won,
      bingos,
      patternBingos,
      decision: null,
      judged: false,
      judgedAt: null,
    },
  });
  // The points land when the TV's verdict does (loop 257): the phase's first tick, at the end of
  // the reveal, credits them (`credit`) and arms the real deadline. Scoring on entry put the
  // winner's new score and check mark on every strip while the card was still being swept.
  const ms = !winnerId || !claim ? BINGO_MS : claimRevealMs(claim.cells, claim.daubs);
  return enterPhase(next, 'bingo', now, ms);
}

/** The verdict has landed (at `now`): score the win (3, 2, 1, then ½ under a pattern — scoring.ts). */
export function credit(state: State, now: number): State {
  const round = state.round;
  if (round.judged || !round.winnerId) return state;
  const points = pointsFor(round.patternBingos);
  return {
    ...state,
    wins: { ...state.wins, [round.winnerId]: (state.wins[round.winnerId] ?? 0) + points },
    round: { ...round, judged: true, judgedAt: now },
  };
}

/**
 * How long the phase waits after the verdict (which landed at `now`): unpaced when the room has a
 * choice to make (BINGO_ABANDONED_MS is only a valve for abandoned rooms), or a moment to read the
 * verdict and then out by itself when nothing is left to play for. A choice already held ends it
 * on the read. All from `now`, never `startedAt`: a VIP pause shifts the deadline, not the start.
 */
function deadlineAfterVerdict(state: State, now: number): number {
  if (state.round.decision) return now + VERDICT_READ_MS;
  const can = canContinue(state);
  if (can.same || can.blackout) return now + BINGO_ABANDONED_MS;
  return now + VERDICT_READ_MS + AUTO_END_MS;
}

/** Cards of `playerId` that have not won the current pattern (the ones BINGO! may still check). */
export function liveCards(state: State, playerId: string): number[] {
  // Own keys only: a fuzzed "__proto__" would read Object.prototype (the sim found it, loop 257).
  const own = <T>(rec: Record<string, T>): T | undefined =>
    Object.hasOwn(rec, playerId) ? rec[playerId] : undefined;
  const locked = new Set(own(state.round.won) ?? []);
  return (own(state.round.cards) ?? []).map((_, i) => i).filter((i) => !locked.has(i));
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
    decision.by,
  );
}

/** When the room has seen the verdict: a moment to read it after it landed (null until it has). */
function celebrationEndsAt(state: State): number | null {
  const at = state.round.judgedAt;
  return at === null ? null : at + VERDICT_READ_MS;
}

export function reduceBingo(state: State, event: GameEvent<Input>, exits: BingoExits): State {
  if (isTimerFor(state, event)) {
    // The first tick of a won round is the verdict: score it, then wait for the room.
    if (state.round.winnerId && !state.round.judged) {
      const scored = credit(state, event.now);
      return {
        ...scored,
        phase: { ...scored.phase, deadline: deadlineAfterVerdict(scored, event.now) },
      };
    }
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
  const decision = { ...input, by: event.playerId };
  if (endsAt !== null && event.now >= endsAt) return decide(state, decision, event.now, exits);
  // Mid-celebration (or before the verdict has even landed): hold it. Once the verdict is in, the
  // deadline comes forward to the end of the read; before that the verdict tick sets it.
  const held = { ...state, round: { ...state.round, decision } };
  return endsAt !== null ? { ...held, phase: { ...held.phase, deadline: endsAt } } : held;
}
