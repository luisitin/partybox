// Phases "vote" and "runoff" (SPEC §10.6): each living player picks another living player, or
// "No one" — resend to change. Votes stay secret until the verdict. Exits when every living
// connected player voted, on the clock, or on the VIP's skip. The result: the top player goes out
// only with more votes than No one and than anyone else; a tie at the top gets one runoff among
// the tied (still tied = nobody); No one level with or ahead of the top = nobody.
import { enterPhase, hasPlayer, isTimerFor } from '@partybox/game-sdk';
import { allLivingDone, candidatesFor, countBy, isAlive } from '../rules';
import { RUNOFF_MS } from '../types';
import type { GameEvent } from '@partybox/game-sdk';
import type { Ballot, Input, State, Transition, Verdict } from '../types';

export function enterVote(state: State, now: number): State {
  const at: State = { ...state, votes: {}, runoff: null, verdict: null, step: 0, stepAt: now };
  return enterPhase(at, 'vote', now, state.cfg.voteSeconds * 1000);
}

export function enterRunoff(state: State, now: number, candidates: string[]): State {
  const at: State = { ...state, votes: {}, runoff: candidates, step: 0, stepAt: now };
  return enterPhase(at, 'runoff', now, RUNOFF_MS);
}

export function reduceVote(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'vote') return state;
  const by = event.playerId;
  const target = event.input.target;
  if (!hasPlayer(state, by) || !isAlive(state, by) || state.votes[by] === target) return state;
  if (target !== 'none' && !candidatesFor(state, by).includes(target)) return state;
  const after: State = { ...state, votes: { ...state.votes, [by]: target } };
  return allLivingDone(after, Object.keys(after.votes)) ? next(after, event.now) : after;
}

/** The ballots in seat order (the verdict lands them face by face). */
export function ballotsOf(state: State): Ballot[] {
  return state.seats
    .filter((id) => Object.hasOwn(state.votes, id) && isAlive(state, id))
    .map((by) => ({ by, target: state.votes[by] as string }));
}

/** Closes the vote: a verdict, or the runoff's candidates. */
export function closeVote(state: State): { runoff: string[] } | Verdict {
  const ballots = ballotsOf(state);
  const none = ballots.filter((b) => b.target === 'none').length;
  const tally = countBy(
    state,
    ballots.map((b) => b.target).filter((t) => t !== 'none'),
  );
  const top = tally[0]?.n ?? 0;
  const runoff = state.runoff !== null;
  if (none >= top) return { ballots, out: null, reason: 'noone', runoff };
  const tied = tally.filter((t) => t.n === top).map((t) => t.id);
  if (tied.length > 1) {
    if (!runoff) return { runoff: tied };
    return { ballots, out: null, reason: 'tie', runoff };
  }
  return { ballots, out: tied[0] ?? null, reason: null, runoff };
}
