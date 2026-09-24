// Phase "bingo": the round is over — or is it. With a winner, their green card is the celebration,
// the win is recorded and that card locked on entry, and the phase then waits for any player's
// choice: keep going on the same cards for the same pattern (the card that won sits it out; the
// winner's other cards play on) or for a blackout, or move on — nobody picking for 20 s after the
// read moves the room on (I-400: it waited 5 minutes). A choice that arrives while the TV is still revealing
// the card is held (`round.decision`) and applied when the celebration ends. With no winner (deck
// empty, VIP skipped through 75 calls) the TV says so for BINGO_MS. `next` and the VIP skip exit
// (scoreboard, or done after the last round); `continue` resumes calling via `resume`, which
// repeats the number that was up.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { clearClaims, setMenu } from '../claims';
import { AUTO_END_MS, VERDICT_READ_MS, claimRevealMs } from '../reveal';
import { pointsFor } from '../scoring';
import { BINGO_MS, DECK, NO_PICK_MS, VOTE_MS } from '../types';
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
  const history = [
    ...state.history,
    {
      round: round.number,
      winnerId,
      calls: round.drawn,
      ...(claim ? { clean: claim.red.length === 0 } : {}), // I-401: for "Clean card"
    },
  ];
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
      votes: {},
      voteEndsAt: null,
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
 * How long the phase waits after the verdict (which landed at `now`): the read plus NO_PICK_MS when
 * the room has a choice to make (I-400: nobody picking moves on), or a moment to read the
 * verdict and then out by itself when nothing is left to play for. A choice already held ends it
 * on the read. All from `now`, never `startedAt`: a VIP pause shifts the deadline, not the start.
 */
function deadlineAfterVerdict(state: State, now: number): number {
  if (state.round.decision) return now + VERDICT_READ_MS;
  // I-105 A: a vote cast before the verdict closes after the read, at its own 6 s mark at the
  // earliest — or at the read if everyone has voted already.
  const votes = state.round.votes ?? {};
  if (Object.keys(votes).length > 0)
    return Math.max(
      now + VERDICT_READ_MS,
      everyoneVoted(state, votes) ? 0 : (state.round.voteEndsAt ?? 0),
    );
  const can = canContinue(state);
  // I-400 A: a choice to make, but not forever — 20 s after the read, nobody picking moves on
  if (can.same || can.blackout) return now + VERDICT_READ_MS + NO_PICK_MS;
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
        votes: {},
        voteEndsAt: null,
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
    // I-105 A: the vote closed — the room's choice is the majority.
    const votes = state.round.votes ?? {};
    if (Object.keys(votes).length > 0) return decide(state, winner(votes), event.now, exits);
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
  if (state.round.decision) return state; // decided already (held for the end of the read)
  // I-105 A: every tap is a vote. The first opens a 6 s vote; each phone may change its mind.
  const vote = { choice: { ...input, by: event.playerId }, at: event.now, vip: event.vip === true };
  const votes = { ...(state.round.votes ?? {}), [event.playerId]: vote };
  const voteEndsAt = state.round.voteEndsAt ?? event.now + VOTE_MS;
  const next: State = { ...state, round: { ...state.round, votes, voteEndsAt } };
  const endsAt = celebrationEndsAt(state);
  if (endsAt === null) return next; // the verdict tick sets the deadline
  // It closes at 6 s — or as soon as every connected person with cards has voted — but never
  // before the celebration's read is over.
  const closeAt = Math.max(endsAt, everyoneVoted(state, votes) ? event.now : voteEndsAt);
  if (event.now >= closeAt) return decide(next, winner(votes), event.now, exits);
  return { ...next, phase: { ...next.phase, deadline: closeAt } };
}

/** I-105 A: the people whose vote closes it early — connected, with cards, not bots. */
function everyoneVoted(state: State, votes: Record<string, unknown>): boolean {
  return Object.keys(state.round.cards)
    .filter((id) => state.players[id]?.connected && !state.players[id]?.bot)
    .every((id) => Object.hasOwn(votes, id));
}

/** I-105 A: the majority's choice; a tie goes to the VIP's vote, else to the first vote cast. */
function winner(votes: Record<string, { choice: Decision; at: number; vip: boolean }>): Decision {
  const all = Object.values(votes).sort((a, b) => a.at - b.at);
  const key = (d: Decision): string => (d.type === 'next' ? 'next' : `continue:${d.pattern}`);
  const counts = new Map<string, number>();
  for (const v of all) counts.set(key(v.choice), (counts.get(key(v.choice)) ?? 0) + 1);
  const top = Math.max(...counts.values());
  const tied = [...counts].filter(([, n]) => n === top).map(([k]) => k);
  const pick =
    (tied.length > 1 ? all.find((v) => v.vip && tied.includes(key(v.choice))) : undefined) ??
    all.find((v) => tied.includes(key(v.choice)));
  return (pick ?? (all[0] as (typeof all)[number])).choice;
}
